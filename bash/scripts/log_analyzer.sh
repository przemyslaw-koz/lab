#!/bin/bash

analyze_logs () {
  echo "argument 1: $1"

  validate "$1"
  file_exists "$1"
  analyze "$1"
  check_tr "$1"
  last_errors "$1"

  if [ -n "$2"]; then
    filter_errors "$1"
  fi
}

validate () {
  if [ -z "$1" ]; then
    echo "argument with file name is missing"
    exit 1
  else
    echo "argument passed"
  fi
}

file_exists () {
  if [ -f "$1" ]; then
    echo "file present"
  else
    echo "missing file"
    exit 1
  fi
}

analyze () {
  echo "number of lines in file: $(wc -l "$1")"
  echo "number of lines with WARNING: $(grep -c "WARNING" "$1")"
  echo "number of lines with ERROR: $(grep -c "ERROR" "$1")"
}

check_tr () {
  result=$(tr -cs '[:alpha:]' '\n' < "$1" | sort | uniq -c | sort -nr | head -5 )
  echo "top words:"
  echo "$result"
}

last_errors () {
  result=$(grep "ERROR" < "$1" | tail -5)
  echo "last errors:"
  echo "$result"
}

filter_errors () {
  local RED=$(tput setaf 1)
  local YELLOW=$(tput setaf 3)
  local BOLD=$(tput bold)
  local RESET=$(tput sgr0)

  local result=$(grep "ERROR" "$1")

  echo "${YELLOW}${BOLD}all ${RED}ERRORS${YELLOW} in logs:${RESET}"
  echo "${RED}$result${RESET}"
}

analyze_logs "$1"
