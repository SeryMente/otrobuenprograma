#!/usr/bin/env python3
"""Compatibility entry point.

The canonical implementation is scripts/benchmark_sync_timing.py.
This filename is preserved so older callers do not silently execute an
OGP-specific benchmark.
"""

import argparse
import subprocess
import sys


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--config", default="scripts/sync-benchmark.config.json")
    parser.add_argument("--timing", default=None)
    parser.add_argument("--canonical", default=None)
    parser.add_argument("--output", default="test-results/benchmark-story-timing.json")
    parser.add_argument("--require-certified", action="store_true")
    args = parser.parse_args()

    command = [
        sys.executable,
        "scripts/benchmark_sync_timing.py",
        "--config",
        args.config,
        "--output",
        args.output,
    ]
    if args.timing:
        command.extend(["--timing", args.timing])
    if args.canonical:
        command.extend(["--canonical", args.canonical])
    if args.require_certified:
        command.append("--require-certified")

    raise SystemExit(subprocess.run(command, check=False).returncode)


if __name__ == "__main__":
    main()
