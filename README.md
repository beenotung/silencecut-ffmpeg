# silencecut-ffmpeg

Auto cut out silent sections from video using ffmpeg filter silencedetect and silenceremove.

[![npm Package Version](https://img.shields.io/npm/v/silencecut-ffmpeg)](https://www.npmjs.com/package/silencecut-ffmpeg)

## Features

- Typescript support
- Isomorphic package: works in Node.js and browsers

## Installation (Optional)

This package can be invoked with npx without explicit installation.

### Option 0: Download the standalone executable

This option is available for Windows, MacOS and Linux users _without nodejs runtime_.

The executable is available in the [release page](https://github.com/beenotung/silencecut-ffmpeg/releases).

After downloading the executable, you can use it as a command line tool. You may add the directory of the executable to your `PATH` environment variable for convenience.

### Option 1: Using `npx` without installation

You can run the tool directly from the npm registry without having to install it globally or locally:

```bash
npx -y silencecut-ffmpeg [options]
```

The `-y` flag skip confirmation to download the package if it is not already cached.

This is convenient for one-off usage as it doesn’t require you to install or manage the tool. However, npx will check for updates each time it is invoked, which can add some overhead.

### Option 2: Install as a version-controlled dependency

To avoid the overhead of npx checking for updates on every run, you can install `silencecut-ffmpeg` as a project dependency. This also ensures that the version you install is locked and won’t apply breaking changes unless you explicitly update it.

Installing the package as a dependency also allows you to use the API programmatically from your Node.js or TypeScript code, enabling more advanced usage like integrating the tool into larger workflows.

Steps:

1. **Install the package** as a project dependency (this will add it to your `package.json`):

   ```bash
   npm install silencecut-ffmpeg
   ```

2. **Invoke the installed version** using `npx`:

   ```bash
   npx silencecut-ffmpeg [options]
   ```

You can also install `silencecut-ffmpeg` with [pnpm](https://pnpm.io/), [yarn](https://yarnpkg.com/), or [slnpm](https://github.com/beenotung/slnpm)

## Usage Example

You can use `silencecut-ffmpeg` from cli or from nodejs.

### Cli Usage

```bash
silencecut-ffmpeg [options] <output file>
```

#### Cli Options

- `-i, --input <file>`: Input file path (required)
- `-d, --duration-threshold <sec>`: Duration threshold in seconds (default: 1)
- `-n, --noise-level-threshold <dB>`: Noise level threshold in dB (default: -50)
- `-v, --version`: Show the version number
- `-h, --help`: Show this help message

#### Cli Usage Examples

1. **Using default duration (1 second) and noise level (-50 dB) thresholds**:

   ```bash
   silencecut-ffmpeg -i in.mp4 out.mp4
   ```

2. **Custom thresholds: 1.5 seconds of silence and -40 dB noise level**:

   ```bash
   silencecut-ffmpeg --input in.mp4 --duration-threshold 1.5 --noise-level-threshold -40 out.mp4
   ```

3. **Fast-paced cutting: detect silence shorter than 0.2 seconds and noise below -40 dB**:
   ```bash
   silencecut-ffmpeg out.mp4 -i in.mp4 -n -40 -d 0.2
   ```

### API Usage

```typescript
import { silentDetectAndRemove } from 'silencecut-ffmpeg'

silentDetectAndRemove({
  inFile: 'in.mp4',
  outFile: 'out.mp4',
  durationThreshold: 1.5, // seconds
  noiseLevelThreshold: -40, // dB
})
  .then(() => {
    console.log('Silent sections removed.')
  })
  .catch(err => {
    console.error(err)
  })
```

## Typescript Signature

```typescript
import { ProgressArgs } from 'ffmpeg-progress'

export type Section = {
  /** @description in seconds */
  start: number
  /** @description in seconds */
  end: number
}

/** @description chain silentDetect() and silentRemove() */
export function silentDetectAndRemove(options: {
  inFile: string
  outFile: string
  /** @description -50 dB */
  noiseLevelThreshold?: number
  /** @description default 1 second */
  durationThreshold?: number
  onSilentDetectDuration?: ProgressArgs['onDuration']
  onSilentDetectProgress?: ProgressArgs['onProgress']
  onSilentRemoveDuration?: ProgressArgs['onDuration']
  onSilentRemoveProgress?: ProgressArgs['onProgress']
}): Promise<{
  nonSilentSections: Section[]
  silentSections: Section[]
}>

export function silentDetect(
  options: {
    file: string
    /** @description -50 dB */
    noiseLevelThreshold?: number
    /** @description default 1000 ms */
    durationThreshold?: number
    onSilentSection?: (section: Section) => void
    onNonSilentSection?: (section: Section) => void
  } & ProgressArgs,
): Promise<{
  silentSections: Section[]
  nonSilentSections: Section[]
}>

export function silentRemove(
  options: {
    inFile: string
    outFile: string
    /** @description nonSilentSections returned by silentDetect() or determined by custom logics */
    sections: Section[]
  } & ProgressArgs,
): Promise<void>
```

## License

This project is licensed with [BSD-2-Clause](./LICENSE)

This is free, libre, and open-source software. It comes down to four essential freedoms [[ref]](https://seirdy.one/2021/01/27/whatsapp-and-the-domestication-of-users.html#fnref:2):

- The freedom to run the program as you wish, for any purpose
- The freedom to study how the program works, and change it so it does your computing as you wish
- The freedom to redistribute copies so you can help others
- The freedom to distribute copies of your modified versions to others
