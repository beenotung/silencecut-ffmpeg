import * as child_process from "node:child_process";
import * as fs from "node:fs";
import { zip } from "zip-a-folder";

// Load the package.json file
let packageJSON = JSON.parse(fs.readFileSync('package.json', 'utf8'));
let cmdName = packageJSON.name;
let version = packageJSON.version;

child_process.execSync("bun run build");

let platforms = [
    "bun-linux-x64-baseline",
    "bun-macos-x64-baseline",
    "bun-windows-x64-baseline"
];

for (let platform of platforms) {
    let os = platform.split("-")[1];
    let dir = `./build/${cmdName}-${version}-${os}`;
    let outputFilename = `${dir}/${cmdName}`;
    let zipFilename = `./build/${cmdName}-${version}-${os}.zip`;

    child_process.execSync(`bun build ./dist/cli.js --compile --minify --target=${platform} --outfile ${outputFilename}`);
    await zip(dir, zipFilename);

    console.log(`Created ${zipFilename}`);
}


