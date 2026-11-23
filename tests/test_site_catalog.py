"""Regression tests for the read-only Pages catalog."""
import json
import tempfile
import unittest
from pathlib import Path

from tools.build_site_catalog import build_catalog, render_markdown


class CatalogTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        for folder in ("topics/acme", "runs/2026-11-23", "reports/llm-news", "okf", "state"):
            (self.root / folder).mkdir(parents=True, exist_ok=True)
        (self.root / "topics/acme/story.json").write_text(json.dumps({
            "record_type":"topic", "schema_version":2, "topic_key":"acme/story/2026-11-23",
            "canonical_title":"A new model", "first_seen_jst":"2026-11-23T12:00:00+09:00",
            "last_seen_jst":"2026-11-23T23:00:00+09:00", "organizations":["Acme"],
            "known_facts":["Verified launch"], "coverage_status":"covered", "sources":["https://example.org"]
        }), encoding="utf-8")
        (self.root / "runs/2026-11-23/night.jsonl").write_text(
            json.dumps({"record_type":"run_event","schema_version":2,"run_name":"LLM Night Lite",
            "run_time_jst":"2026-11-23T23:30:00+09:00","classification":"FOLLOW_UP",
            "topic_key":"acme/story/2026-11-23","notes":"New evidence"})+"\n",encoding="utf-8")
        (self.root / "reports/llm-news/sample.md").write_text(
            "---\ntitle: Test Report\ndescription: Important notes\ncreated: 2026-11-23\n"
            "tags: [research, model]\n---\n\n# Heading\n\nSafe **Markdown** and [guide](../../okf/guide.md).\n",
            encoding="utf-8")
        (self.root / "okf/guide.md").write_text("# Guide\n\nInstructions.",encoding="utf-8")
        (self.root / "state/llm-news-ledger.md").write_text("# Ledger\n",encoding="utf-8")

    def tearDown(self):
        self.temp.cleanup()

    def test_counts_references_and_content(self):
        index = build_catalog(self.root)
        self.assertEqual(index["counts"],{"topics":1,"runs":1,"reports":1,"references":2,"total":5})
        self.assertEqual(index["years"],["2026"])
        topic = next(doc for doc in index["documents"] if doc["kind"] == "topic")
        run = next(doc for doc in index["documents"] if doc["kind"] == "run")
        report = next(doc for doc in index["documents"] if doc["kind"] == "report")
        self.assertEqual(run["relatedTopicId"],topic["id"])
        self.assertEqual(run["status"],"FOLLOW_UP")
        self.assertEqual(topic["sortDate"],"2026-11-23T23:00:00+09:00")
        self.assertIn("<strong>Markdown</strong>",report["bodyHtml"])
        self.assertIn("github.com/4i7/LLM-News-Memo/blob/main/okf/guide.md",report["bodyHtml"])

    def test_new_files_automatically_appear(self):
        before = build_catalog(self.root)["counts"]["topics"]
        original = json.loads((self.root / "topics/acme/story.json").read_text())
        original["topic_key"] = "acme/another/2026-11-24"
        (self.root / "topics/acme/new.json").write_text(json.dumps(original))
        self.assertEqual(build_catalog(self.root)["counts"]["topics"],before+1)

    def test_legacy_files_are_not_read_or_modified(self):
        legacy = self.root / "state/llm-news-seen.jsonl"
        legacy.write_text("INVALID OLD JSONL (not canonical)",encoding="utf-8")
        before = legacy.read_bytes()
        self.assertEqual(build_catalog(self.root)["counts"]["topics"],1)
        self.assertEqual(legacy.read_bytes(),before)

    def test_invalid_jsonl_fails_build(self):
        (self.root / "runs/2026-11-23/night.jsonl").write_text("{bad json\n")
        with self.assertRaisesRegex(ValueError,"night.jsonl:1"):
            build_catalog(self.root)

    def test_html_is_escaped_and_unsafe_links_rejected(self):
        output = render_markdown("<script>alert(1)</script>\n\n[x](javascript:alert(1))",
                                 "reports/test.md")
        self.assertNotIn("<script>",output)
        self.assertNotIn('href="javascript:',output)
        self.assertIn("&lt;script&gt;",output)


if __name__ == "__main__":
    unittest.main()
