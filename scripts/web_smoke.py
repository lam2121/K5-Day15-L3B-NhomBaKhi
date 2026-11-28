"""Smoke test for a running CramAI web service (feature 003, T011). Standard library only.

Usage:
    python scripts/web_smoke.py http://127.0.0.1:8000
Admin checks use CRAMAI_ADMIN_USER / CRAMAI_ADMIN_PASSWORD from the environment.
Exits non-zero on the first failed check.
"""

import base64
import json
import os
import sys
import time
import urllib.error
import urllib.request


def call(base: str, path: str, *, method: str = "GET", body: dict | None = None, auth: tuple[str, str] | None = None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(base + path, data=data, method=method)
    if data is not None:
        req.add_header("Content-Type", "application/json")
    if auth:
        req.add_header("Authorization", "Basic " + base64.b64encode(f"{auth[0]}:{auth[1]}".encode()).decode())
    try:
        with urllib.request.urlopen(req, timeout=10) as res:
            return res.status, res.headers.get("content-type", ""), res.read()
    except urllib.error.HTTPError as err:
        return err.code, err.headers.get("content-type", ""), err.read()


def check(label: str, condition: bool, detail: str = "") -> None:
    print(("ok   " if condition else "FAIL ") + label + (f" ({detail})" if detail and not condition else ""))
    if not condition:
        sys.exit(1)


def main() -> None:
    base = (sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000").rstrip("/")
    for _ in range(60):
        try:
            if call(base, "/api/v1/health")[0] == 200:
                break
        except OSError:
            pass
        time.sleep(1)

    status, _, raw = call(base, "/api/v1/health")
    check("health 200", status == 200, raw[:200].decode(errors="replace"))

    status, _, raw = call(base, "/api/v1/catalog")
    exams = json.loads(raw)["exams"] if status == 200 else []
    check("catalog has 15 items", status == 200 and len(exams) == 15, f"{status}")

    status, _, raw = call(base, "/api/v1/attempts", method="POST", body={"exam_id": "slide-01"})
    attempt = json.loads(raw)
    check("attempt 201 with 5 questions", status == 201 and len(attempt.get("questions", [])) == 5, raw[:200].decode(errors="replace"))
    check("attempt hides the answer key", b"correct_option_id" not in raw and b"citations" not in raw)

    answers = [{"question_id": q["question_id"], "option_id": q["options"][0]["option_id"]} for q in attempt["questions"]]
    status, _, raw = call(base, "/api/v1/submissions", method="POST", body={"attempt_id": attempt["attempt_id"], "answers": answers})
    check("submission 200 with citations", status == 200 and all(i["citations"] for i in json.loads(raw)["items"]), f"{status}")

    status, ctype, raw = call(base, "/")
    check("student page served", status == 200 and "text/html" in ctype and b'id="root"' in raw, f"{status} {ctype}")

    status, _, _ = call(base, "/admin/")
    check("admin page needs login", status == 401, f"{status}")
    status, _, _ = call(base, "/api/v1/admin/slides")
    check("admin API needs login", status == 401, f"{status}")

    user, password = os.environ.get("CRAMAI_ADMIN_USER", ""), os.environ.get("CRAMAI_ADMIN_PASSWORD", "")
    if user and password:
        status, ctype, _ = call(base, "/admin/", auth=(user, password))
        check("admin page with login", status == 200 and "text/html" in ctype, f"{status}")
        status, _, raw = call(base, "/api/v1/admin/slides", auth=(user, password))
        check("admin API lists 14 slots", status == 200 and len(json.loads(raw)["slides"]) == 14, f"{status}")
    print("smoke passed")


if __name__ == "__main__":
    main()
