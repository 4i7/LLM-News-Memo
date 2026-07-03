# Run Events

This directory contains small append-style JSONL files created per scheduled run.

Path convention:

```text
runs/YYYY-MM-DD/<run-name>-<slug>.jsonl
```

A run event file records what the scheduled task selected, skipped, or updated. Creating a new run event file avoids rewriting a growing global JSONL file.
