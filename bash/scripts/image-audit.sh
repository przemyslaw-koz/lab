#!/bin/bash

main () {
  validate "$1"
  local dir=$(set_dir "$1")

  echo "Working on dir: $dir"
}

validate () {
  if [[ -n "$1" && ! -d "$1" ]]; then
    echo "Directory does not exist." >&2
    exit 2
  fi
}

set_dir () {
  if [[ -z "$1" ]]; then
    echo "."
  else
    echo "$1"
  fi
}

main "$1"
