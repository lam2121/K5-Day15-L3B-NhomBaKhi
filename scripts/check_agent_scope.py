"""Check that a CramAI branch only changes files assigned to its role."""

import argparse
import re
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
ROLE_FILES = {
    "lam": {
        ".gitignore", ".env.example", "AGENTS.md", "README.md", "TEAMS.md",
        "spec.md", "tasks.md", "requirements.txt", "codebase/ai.py", "codebase/contracts.py",
        ".github/workflows/ci.yml", "docs/agents.md", "docs/ci-cd.md", "docs/connect-model.md",
        "docs/ai-usage.md", "eval/README.md",
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
    "lam": (".agents/", ".specify/", "specs/", "scripts/", "tests/", "traces/"),
    "hung": ("codebase/prompts/",),
    "khiem": ("data/", "evidence/interviews/", "evidence/survey/", "evidence/scripts/"),
    "phuoc-anh": ("slides/", "validation/"),
}
RUN_FILE = re.compile(r"(?:eval/run-[0-9]+\.csv|cost/simulate-[0-9]+(?:\.csv|-summary\.md))")


def is_owned(role: str, path: str) -> bool:
    return (
        path in ROLE_FILES[role]
        or path.startswith(ROLE_DIRS[role])
        or (role == "lam" and RUN_FILE.fullmatch(path) is not None)
    )


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

    rejected = sorted(path for path in paths if not is_owned(options.role, path))
    if rejected:
        print(f"Outside scope for {options.role}:", file=sys.stderr)
        for path in rejected:
            print(f"  {path!r}", file=sys.stderr)
        return 1
    print(f"Scope OK for {options.role}: {len(paths)} changed file(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
