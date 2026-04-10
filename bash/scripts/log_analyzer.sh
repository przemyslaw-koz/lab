#!/bin/bash

analyze_logs () {
  echo "argument 1: $1"

  validate $1
  file_exists $1
  analyze $1
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
  echo "number of lines in file: $(wc -l $1)"
  echo "number of lines with WARNING: $(grep -c "WARNING" $1)"
  echo "number of lines with ERROR: $(grep -c "ERROR" $1)"
}

analyze_logs "$1"
