import subprocess
import tempfile
import unittest
from pathlib import Path

from scripts.check_agent_scope import changed_files, is_owned


class ScopeTests(unittest.TestCase):
    def setUp(self):
        directory = tempfile.TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        self.repo = Path(directory.name)
        self.git("init", "-q")
        self.git("config", "user.email", "scope-test@example.invalid")
        self.git("config", "user.name", "CramAI scope test")
        self.write("codebase/agent.py", "old\n")
        self.write("codebase/tools.py", "old\n")
        self.git("add", ".")
        self.git("commit", "-qm", "baseline")
        self.git("branch", "baseline")

    def git(self, *args):
        subprocess.run(["git", *args], cwd=self.repo, check=True, capture_output=True)

    def write(self, name, content):
        path = self.repo / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(content, encoding="utf-8")

    def test_committed_staged_and_untracked_changes(self):
        self.write("codebase/agent.py", "own change\n")
        self.git("add", "codebase/agent.py")
        self.git("commit", "-qm", "workflow")
        self.write("codebase/tools.py", "foreign staged change\n")
        self.git("add", "codebase/tools.py")
        self.write("codebase/tools.py", "old\n")
        self.write("slides/đề ôn.md", "foreign untracked change\n")

        paths = changed_files(self.repo, "baseline")
        self.assertEqual(paths, {"codebase/agent.py", "codebase/tools.py", "slides/đề ôn.md"})
        self.assertEqual({path for path in paths if is_owned("hung", path)}, {"codebase/agent.py"})

    def test_boundary_checks_both_ends_of_a_rename(self):
        (self.repo / "data").mkdir()
        self.git("mv", "codebase/agent.py", "data/workflow.py")
        paths = changed_files(self.repo, "baseline")
        self.assertEqual(paths, {"codebase/agent.py", "data/workflow.py"})
        self.assertFalse(is_owned("hung", "data/workflow.py"))

    def test_harness_and_official_results(self):
        for role in ("lam", "hung", "khiem", "phuoc-anh"):
            self.assertFalse(is_owned(role, "run.py"))
            self.assertEqual(is_owned(role, ".github/workflows/ci.yml"), role == "lam")
            self.assertEqual(is_owned(role, "eval/run-1.csv"), role == "lam")
            self.assertEqual(is_owned(role, "cost/simulate-1-summary.md"), role == "lam")
