#!/usr/bin/env bash
set -euo pipefail

image="delbertbeta/fuku:latest"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
project_root="$(cd "${script_dir}/.." && pwd)"

cd "${project_root}"

echo "Building ${image}..."
docker build -t "${image}" .

echo "Pushing ${image}..."
docker push "${image}"

echo "Done."
