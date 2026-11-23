#!/usr/bin/env python3
"""Build a read-only Pages index; never modify canonical/legacy ledger data."""
from __future__ import annotations

import argparse
import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, urljoin, urlsplit

import mistune

ROOT = Path(__file__).resolve().parents[1]
REPO = "https://github.com/4i7/LLM-News-Memo"
DATE = re.compile(r"\b20\d{2}-\d{2}-\d{2}\b")
FRONTMATTER = re.compile(r"\A---\s*\n(.*?)\n---\s*\n", re.DOTALL)


def relative(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def link_to(path: str) -> str:
    return REPO + "/blob/main/" + quote(path, safe="/")


def array(value: object) -> list[str]:
    return [str(item) for item in value if item is not None] if isinstance(value, list) else []


def search_text(*items: object) -> str:
    return " ".join(json.dumps(item, ensure_ascii=False) if isinstance(item, (dict, list)) else str(item) for item in items if item is not None)


def frontmatter(raw: str) -> tuple[dict, str]:
    match = FRONTMATTER.match(raw)
    if not match:
        return {}, raw
    meta = {}
    for line in match.group(1).splitlines():
        found = re.match(r"^([a-zA-Z_][\w-]*):\s*(.*)$", line)
        if not found:
            continue
        key, value = found.groups()
        value = value.strip().strip('"').strip("'")
        meta[key] = [x.strip().strip('"').strip("'") for x in value[1:-1].split(",") if x.strip()] if value.startswith("[") and value.endswith("]") else value
    return meta, raw[match.end():]


def summary(body: str) -> str:
    for line in body.splitlines():
        line = line.strip()
        if not line or line.startswith(("#", ">", "|", "-", "*", chr(96) * 3)):
            continue
        if re.match(r"^\d+\.\s", line):
            continue
        return re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", line).replace("**", "")[:300]
    return ""


class SafeRenderer(mistune.HTMLRenderer):
    def __init__(self, path: str):
        super().__init__(escape=True)
        self.path = path

    def allowed(self, url: str, image: bool = False) -> str | None:
        if not url or url.startswith("//"):
            return None
        scheme = urlsplit(url).scheme.lower()
        if scheme and scheme not in ("http", "https", "mailto"):
            return None
        if scheme:
            return url
        base = ("https://raw.githubusercontent.com/4i7/LLM-News-Memo/main/" if image else REPO + "/blob/main/") + quote(self.path, safe="/")
        return urljoin(base, url)

    def link(self, text: str, url: str, title: str | None = None) -> str:
        dest = self.allowed(url)
        if not dest:
            return text
        title_attr = ' title="' + html.escape(title, quote=True) + '"' if title else ""
        return '<a target="_blank" rel="noopener noreferrer" href="' + html.escape(dest, quote=True) + '"' + title_attr + ">" + text + "</a>"

    def image(self, text: str, url: str, title: str | None = None) -> str:
        dest = self.allowed(url, image=True)
        if not dest:
            return text
        alt = html.escape(re.sub(r"<[^>]*>", "", text), quote=True)
        return '<img loading="lazy" alt="' + alt + '" src="' + html.escape(dest, quote=True) + '">'


def render_markdown(body: str, path: str) -> str:
    return mistune.create_markdown(renderer=SafeRenderer(path), plugins=["table", "strikethrough"])(body)


def topic(path: Path, root: Path) -> dict:
    name = relative(path, root)
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or data.get("record_type") != "topic" or not data.get("topic_key"):
        raise ValueError("Invalid topic: " + name)
    first = str(data.get("first_seen_jst") or "")
    last = str(data.get("last_seen_jst") or first)
    key = str(data["topic_key"])
    title = str(data.get("canonical_title") or key)
    facts = array(data.get("known_facts"))
    found = DATE.search(name)
    return {
        "id": "topic:" + name, "kind": "topic", "path": name, "topicKey": key,
        "title": title, "summary": facts[0] if facts else str(data.get("notes") or data.get("treatment") or ""),
        "date": first, "sortDate": last, "year": first[:4] or (found.group(0)[:4] if found else ""),
        "status": str(data.get("coverage_status") or "unknown"),
        "organizations": array(data.get("organizations")),
        "tags": [str(data.get("event_type") or "other")] + array(data.get("products")),
        "searchText": search_text(data), "detail": data
    }


def run_events(path: Path, root: Path, topics: dict[str, dict]) -> list[dict]:
    name = relative(path, root)
    result = []
    for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            data = json.loads(line)
        except json.JSONDecodeError as exc:
            raise ValueError(f"{name}:{lineno}: {exc}") from exc
        if not isinstance(data, dict) or data.get("record_type") != "run_event":
            raise ValueError(f"Invalid run event: {name}:{lineno}")
        key = str(data.get("topic_key") or "")
        matching = topics.get(key, {})
        stamp = str(data.get("run_time_jst") or name.split("/")[1])
        result.append({
            "id": "run:" + name + "#" + str(lineno), "kind": "run", "path": name,
            "line": lineno, "topicKey": key, "relatedTopicId": matching.get("id"),
            "title": matching.get("title") or key or "Run event", "summary": str(data.get("notes") or ""),
            "date": stamp, "sortDate": stamp, "year": stamp[:4],
            "status": str(data.get("classification") or "unknown"),
            "organizations": matching.get("organizations", []),
            "tags": [str(data.get("run_name") or "")],
            "searchText": search_text(data, matching.get("title"), matching.get("organizations")),
            "detail": data
        })
    return result


def article(path: Path, root: Path, kind: str) -> dict:
    name = relative(path, root)
    meta, body = frontmatter(path.read_text(encoding="utf-8"))
    heading = re.search(r"^#\s+(.+)$", body, re.MULTILINE)
    title = str(meta.get("title") or (heading.group(1) if heading else path.stem.replace("-", " ")))
    description = str(meta.get("description") or summary(body))
    stamp = next((str(meta[key]) for key in ("updated", "timestamp", "created", "date") if isinstance(meta.get(key), str) and DATE.search(meta[key])), "")
    if not stamp:
        found = DATE.search(name)
        stamp = found.group(0) if found else ""
    tags = meta.get("tags") if isinstance(meta.get("tags"), list) else []
    return {
        "id": kind + ":" + name, "kind": kind, "path": name,
        "title": title, "summary": description, "date": stamp, "sortDate": stamp,
        "year": stamp[:4], "status": str(meta.get("status") or "published"),
        "organizations": [], "tags": tags, "searchText": search_text(title, description, tags, body),
        "bodyHtml": render_markdown(body, name)
    }


def build_catalog(root: Path = ROOT) -> dict:
    topics = [topic(path, root) for path in sorted((root / "topics").rglob("*.json"))]
    topic_index = {entry["topicKey"]: entry for entry in topics}
    if len(topic_index) != len(topics):
        raise ValueError("Duplicate canonical topic keys")
    runs = []
    for path in sorted((root / "runs").rglob("*.jsonl")):
        runs.extend(run_events(path, root, topic_index))
    reports = [article(p, root, "report") for p in sorted((root / "reports").rglob("*.md"))]
    references = list(sorted((root / "okf").rglob("*.md")))
    ledger = root / "state" / "llm-news-ledger.md"
    if ledger.is_file():
        references.append(ledger)
    guides = [article(p, root, "reference") for p in references]
    documents = topics + runs + reports + guides
    return {
        "schemaVersion": 1,
        "generatedAt": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "counts": {"topics": len(topics), "runs": len(runs), "reports": len(reports), "references": len(guides), "total": len(documents)},
        "years": sorted({item["year"] for item in documents if item["year"]}, reverse=True),
        "documents": documents
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output", type=Path, default=ROOT / "site" / "catalog.json")
    opts = parser.parse_args()
    data = build_catalog()
    opts.output.parent.mkdir(parents=True, exist_ok=True)
    opts.output.write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")) + "\n", encoding="utf-8")
    print("Catalog:", data["counts"])


if __name__ == "__main__":
    main()
