#!/usr/bin/env python3
"""
Dump a project's directory structure into a text file.

Examples:
  python dump_project_structure.py
  python dump_project_structure.py --root . --out project-structure.txt
  python dump_project_structure.py --max-depth 6 --include-hidden
"""

from __future__ import annotations;

import argparse;
import os;
from dataclasses import dataclass;
from pathlib import Path;
from typing import Iterable;


DEFAULT_EXCLUDES = {
  ".git",
  ".idea",
  ".vscode",
  "__pycache__",
  ".pytest_cache",
  ".mypy_cache",
  ".ruff_cache",
  ".venv",
  "venv",
  "node_modules",
  "dist",
  "build",
  ".next",
  ".turbo",
  ".cache",
  "coverage",
  ".terraform",
  ".serverless",
};


@dataclass(frozen=True)
class Options:
  root: Path;
  out: Path;
  max_depth: int;
  include_hidden: bool;
  show_sizes: bool;
  excludes: set[str];


def _is_hidden(path: Path) -> bool:
  return path.name.startswith(".");


def _should_skip(path: Path, opts: Options) -> bool:
  if path.name in opts.excludes:
    return True;
  if not opts.include_hidden and _is_hidden(path):
    return True;
  return False;


def _safe_rel(path: Path, root: Path) -> str:
  try:
    return str(path.relative_to(root));
  except Exception:
    return str(path);


def _format_entry(path: Path, root: Path, is_dir: bool, opts: Options) -> str:
  rel = _safe_rel(path, root);
  if is_dir:
    return f"{rel}/";
  if opts.show_sizes:
    try:
      size = path.stat().st_size;
      return f"{rel} ({size} bytes)";
    except OSError:
      return f"{rel} (size: n/a)";
  return rel;


def _iter_children_sorted(dir_path: Path) -> Iterable[Path]:
  try:
    items = list(dir_path.iterdir());
  except OSError:
    return [];
  # dirs first, then files; alphabetical
  items.sort(key=lambda p: (not p.is_dir(), p.name.lower()));
  return items;


def dump_tree(opts: Options) -> str:
  root = opts.root.resolve();
  lines: list[str] = [];
  lines.append(f"Root: {root}");
  lines.append("");

  def walk(current: Path, depth: int) -> None:
    if depth > opts.max_depth:
      return;

    children = list(_iter_children_sorted(current));
    # filter
    children = [c for c in children if not _should_skip(c, opts)];

    for idx, child in enumerate(children):
      is_last = idx == len(children) - 1;
      branch = "└── " if is_last else "├── ";
      indent = "    " if is_last else "│   ";

      prefix = "";
      if depth > 0:
        # build prefix from stored "spine" markers in stack
        prefix = "".join(stack);

      entry = _format_entry(child, root, child.is_dir(), opts);
      lines.append(f"{prefix}{branch}{entry}");

      if child.is_dir():
        if depth == opts.max_depth:
          continue;
        # extend stack
        stack.append(indent);
        walk(child, depth + 1);
        stack.pop();

  # stack keeps the prefix parts like "│   " / "    "
  stack: list[str] = [];
  walk(root, 0);

  lines.append("");
  lines.append(f"Excluded names: {', '.join(sorted(opts.excludes))}");
  lines.append(f"Include hidden: {opts.include_hidden}");
  lines.append(f"Max depth: {opts.max_depth}");
  lines.append(f"Show sizes: {opts.show_sizes}");
  lines.append("");

  return "\n".join(lines);


def parse_args() -> Options:
  parser = argparse.ArgumentParser(description="Save project directory structure to a text file.");
  parser.add_argument("--root", default=".", help="Project root directory (default: current).");
  parser.add_argument("--out", default="project-structure.txt", help="Output text file path.");
  parser.add_argument("--max-depth", type=int, default=12, help="Maximum depth to traverse (default: 12).");
  parser.add_argument("--include-hidden", action="store_true", help="Include hidden files/dirs (dotfiles).");
  parser.add_argument("--show-sizes", action="store_true", help="Include file sizes in bytes.");
  parser.add_argument(
    "--exclude",
    action="append",
    default=[],
    help="Add an excluded name (can be used multiple times). Example: --exclude .env",
  );

  args = parser.parse_args();

  root = Path(args.root);
  out = Path(args.out);

  excludes = set(DEFAULT_EXCLUDES);
  for name in args.exclude:
    if name:
      excludes.add(name);

  return Options(
    root=root,
    out=out,
    max_depth=max(0, args.max_depth),
    include_hidden=bool(args.include_hidden),
    show_sizes=bool(args.show_sizes),
    excludes=excludes,
  );


def main() -> int:
  opts = parse_args();
  text = dump_tree(opts);

  opts.out.parent.mkdir(parents=True, exist_ok=True);
  opts.out.write_text(text, encoding="utf-8");

  print(f"Wrote: {opts.out.resolve()}");
  return 0;


if __name__ == "__main__":
  raise SystemExit(main());
