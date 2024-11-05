#!/bin/bash
set -e
set -o pipefail

name="$(node -p "require('./package.json').name")"
version="$(node -p "require('./package.json').version")"

echo "Building $name $version"

npm run build

rm -rf build
mkdir build

function build_for_platform {
	platform="$1"
	target="bun-$platform-x64-baseline"
	outfile="build/$name-$version-$platform"
	bun build dist/cli.js --compile --target="$target" --outfile "$outfile"
}

set -v

build_for_platform "linux"
build_for_platform "macos"
build_for_platform "windows"

cd build
xz -k -T0 "$name-$version-linux"
zip -r -9 "$name-$version-macos.zip" "$name-$version-macos"
7z a -mx9 "$name-$version-windows.7z" "$name-$version-windows.exe"
