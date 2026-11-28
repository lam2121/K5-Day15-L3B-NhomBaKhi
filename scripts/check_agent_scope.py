"""Check that a CramAI branch only changes files assigned to its role."""

import argparse
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ROLE_FILES = {
    "lam": {
        ".gitignore", ".dockerignore", ".env.example", "AGENTS.md", "README.md", "TEAMS.md",
        "spec.md", "tasks.md", "requirements.txt", "codebase/ai.py", "codebase/contracts.py",
        ".github/workflows/ci.yml", "docs/agents.md", "docs/ci-cd.md", "docs/connect-model.md",
        "docs/ai-usage.md", "docs/deploy-oracle-vps.md", "eval/README.md",
        "reflection/nguyen-van-lam.md",
    },
    "hung": {"codebase/agent.py", "eval/report.md", "reflection/nguyen-duy-hung.md"},
    "khiem": {
        "codebase/tools.py", "eval/benchmark.csv", "evidence/hypothesis.md",
        "evidence/data-mining.md", "reflection/nguyen-trong-khiem.md",
    },
    "phuoc-anh": {
        "codebase/app.py", "canvas.md", "evidence/summary.md", "eval/metric_spec.yaml",
        "cost/personas.yaml", "cost/cost-estimate.md", "demo-slides.pdf", "reflection/bui-phuoc-anh.md",
    },
}
ROLE_DIRS = {
    "lam": (".agents/", ".specify/", "specs/", "scripts/", "tests/", "traces/", "backend/", "deploy/"),
    "hung": ("codebase/prompts/",),
    "khiem": ("data/", "evidence/interviews/", "evidence/survey/", "evidence/scripts/"),
    "phuoc-anh": ("slides/", "validation/", "frontend/"),
}
RUN_FILE = re.compile(r"(?:eval/run-[0-9]+\.csv|cost/simulate-[0-9]+(?:\.csv|-summary\.md))")
TASK_SCOPE_OVERRIDES = {
    # One coordinated product change approved by the code owners after CP2.
    "lam": {
        "T028": {"codebase/app.py", "codebase/agent.py"},
        # The role-hung agent delivered the shared web exam generator for T003;
        # Lâm integrates it into the backend via T007 on the integration branch.
        "T003": {"codebase/agent.py"},
        # Group-approved CP4 integration: Lâm copies the measured simulation into
        # Phước Anh's estimate and reconciles the shared slide checklist.
        "T022": {"cost/cost-estimate.md"},
        "T024": {
            "slides/outline.md", "slides/content.md",
            "demo-slides.pdf", ".gitattributes",
        },
        # T013 is a coordinated explanation feature: Lâm owns its backend and contract;
        # Phước Anh owns the student UI, with Docker keeping PDFs on the private /data volume.
        "T013": {
            "Dockerfile",
            "frontend/admin/",
            "frontend/student/",
            "frontend/web/src/shared/types.ts",
            "frontend/web/src/student/Quiz.tsx",
            "frontend/web/src/student/mock.ts",
        },
    },
}


def is_owned(role: str, path: str) -> bool:
    return (
        path in ROLE_FILES[role]
        or path.startswith(ROLE_DIRS[role])
        or (role == "lam" and RUN_FILE.fullmatch(path) is not None)
    )


def is_in_scope(role: str, path: str, task_ids: set[str] | None = None) -> bool:
    """Allow only paths explicitly approved for a task-scoped integration change."""
    if is_owned(role, path):
        return True
    for task_id in task_ids or set():
        overrides = TASK_SCOPE_OVERRIDES.get(role, {}).get(task_id, set())
        if path in overrides or any(override.endswith("/") and path.startswith(override) for override in overrides):
            return True
    return False


def git(root: Path, *args: str) -> str:
    result = subprocess.run(["git", *args], cwd=root, capture_output=True, check=False)
    if result.returncode:
        raise RuntimeError(result.stderr.decode("utf-8", errors="replace").strip() or "Git failed")
    return result.stdout.decode("utf-8", errors="surrogateescape")


def changed_files(root: Path, base: str) -> set[str]:
    commit = git(root, "rev-parse", "--verify", "--end-of-options", f"{base}^{{commit}}").strip()
    merge_base = git(root, "merge-base", commit, "HEAD").strip()
    diff = ("diff", "--name-only", "--no-renames", "-z")
    outputs = (
        git(root, *diff, merge_base, "HEAD", "--"),
        git(root, *diff, "--cached", "HEAD", "--"),
        git(root, *diff, "--"),
        git(root, "ls-files", "--others", "--exclude-standard", "-z"),
    )
    return {path for output in outputs for path in output.split("\0") if path}


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--role", required=True, choices=ROLE_FILES)
    parser.add_argument("--base", default="origin/main", help="PR target or integration baseline")
    options = parser.parse_args()

    try:
        paths = changed_files(ROOT, options.base)
    except (OSError, RuntimeError) as error:
        print(f"Cannot check scope against {options.base!r}: {error}", file=sys.stderr)
        return 2

    try:
        base_commit = git(ROOT, "rev-parse", "--verify", "--end-of-options", f"{options.base}^{{commit}}").strip()
        merge_base = git(ROOT, "merge-base", base_commit, "HEAD").strip()
        subjects = git(ROOT, "log", "--format=%s", f"{merge_base}..HEAD").splitlines()
    except (OSError, RuntimeError) as error:
        print(f"Cannot read task IDs from commits on this branch: {error}", file=sys.stderr)
        return 2
    task_ids = {
        task_id
        for subject in subjects
        for task_id in re.findall(r"\[(T\d{3})\]", subject)
    }
    rejected = sorted(path for path in paths if not is_in_scope(options.role, path, task_ids))
    if rejected:
        print(f"Outside scope for {options.role}:", file=sys.stderr)
        for path in rejected:
            print(f"  {path!r}", file=sys.stderr)
        return 1
    print(f"Scope OK for {options.role}: {len(paths)} changed file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
