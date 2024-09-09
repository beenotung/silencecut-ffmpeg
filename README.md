# silentremove-ffmpeg

Detect and remove silent sections from video using ffmpeg.

[![npm Package Version](https://img.shields.io/npm/v/silentremove-ffmpeg)](https://www.npmjs.com/package/silentremove-ffmpeg)
[![Minified Package Size](https://img.shields.io/bundlephobia/min/silentremove-ffmpeg)](https://bundlephobia.com/package/silentremove-ffmpeg)
[![Minified and Gzipped Package Size](https://img.shields.io/bundlephobia/minzip/silentremove-ffmpeg)](https://bundlephobia.com/package/silentremove-ffmpeg)
[![npm Package Downloads](https://img.shields.io/npm/dm/silentremove-ffmpeg)](https://www.npmtrends.com/silentremove-ffmpeg)

## Features

- Typescript support
- Isomorphic package: works in Node.js and browsers

## Installation

```bash
npm install silentremove-ffmpeg
```

You can also install `silentremove-ffmpeg` with [pnpm](https://pnpm.io/), [yarn](https://yarnpkg.com/), or [slnpm](https://github.com/beenotung/slnpm)

## Usage Example

```typescript
import {} from 'silentremove-ffmpeg'
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
