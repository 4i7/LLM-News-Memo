# Topic Records

One small JSON file per canonical topic.

Path convention:

```text
topics/<organization>/<product-or-model>/<event-type>/<YYYY-MM-DD>.json
```

Scheduled runs should update only the relevant topic file or create a new topic file for a new story. The legacy `state/llm-news-seen.jsonl` file is not the writeback target.
