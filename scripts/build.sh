#!/bin/bash
set -e
set -o pipefail

name="$(node -p "require('./package.json').name")"
version="$(node -p "require('./package.json').version")"

echo "Building $name $version"

npm run build

mkdir -p build

function build_for_platform {
	platform="$1"
	target="bun-$platform-x64-baseline"
	outfile="build/$name-$version-$platform"
	bun build dist/cli.js --compile --target="$target" --outfile "$outfile"
}

build_for_platform "linux"
build_for_platform "macos"
build_for_platform "windows"
