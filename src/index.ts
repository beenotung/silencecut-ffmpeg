import { spawn } from 'child_process'
import {
  attachChildProcess,
  parseToSeconds,
  ProgressArgs,
} from 'ffmpeg-progress'

export type Section = {
  /** @description in seconds */
  start: number
  /** @description in seconds */
  end: number
}

export async function silentDetectAndRemove(options: {
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
}) {
  let { nonSilentSections, silentSections } = await silentDetect({
    file: options.inFile,
    noiseLevelThreshold: options.noiseLevelThreshold,
    durationThreshold: options.durationThreshold,
    onDuration: options.onSilentDetectDuration,
    onProgress: options.onSilentDetectProgress,
  })
  await silentRemove({
    inFile: options.inFile,
    outFile: options.outFile,
    sections: nonSilentSections,
    onDuration: options.onSilentRemoveDuration,
    onProgress: options.onSilentRemoveProgress,
  })
  return { nonSilentSections, silentSections }
}

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
) {
  return new Promise<{
    silentSections: Section[]
    nonSilentSections: Section[]
  }>(async (resolve, reject) => {
    try {
      let { file } = options
      let n = (options.noiseLevelThreshold ?? -50) + 'dB'
      let d = options.durationThreshold ?? 1
      let cmd = 'ffmpeg'
      let args = [
        '-i',
        file,
        '-af',
        `silencedetect=n=${n}:d=${d}`,
        '-f',
        'null',
        '-',
      ]
      let childProcess = spawn(cmd, args)
      let nonSilenceStart = 0
      let silenceStart = 0
      let silenceEnd = 0
      let silentSections: Section[] = []
      let nonSilentSections: Section[] = []
      childProcess.stderr.on('data', (data: Buffer) => {
        let line = data.toString()

        let pattern = 'silence_start: '
        let index = line.indexOf(pattern)
        if (index !== -1) {
          silenceStart = parseFloat(line.slice(index + pattern.length))
          return
        }

        pattern = 'silence_end: '
        index = line.indexOf(pattern)
        if (index !== -1) {
          silenceEnd = parseFloat(line.slice(index + pattern.length))

          /* previous non-silent section */
          if (silenceStart > 0) {
            let section: Section = {
              start: nonSilenceStart,
              end: silenceStart,
            }
            nonSilentSections.push(section)
            options.onNonSilentSection?.(section)
          }

          /* current silent section */
          {
            let section: Section = { start: silenceStart, end: silenceEnd }
            silentSections.push(section)
            options.onSilentSection?.(section)
          }

          nonSilenceStart = silenceEnd

          return
        }
      })
      let totalDuration = 0
      await attachChildProcess({
        childProcess,
        ...options,
        onDuration(duration_threshold) {
          totalDuration = parseToSeconds(duration_threshold)
          options.onDuration?.(duration_threshold)
        },
      })

      /* last non-silent section */
      if (silenceEnd < totalDuration) {
        let section: Section = { start: silenceEnd, end: totalDuration }
        nonSilentSections.push(section)
        options.onNonSilentSection?.(section)
      }
      resolve({ silentSections, nonSilentSections })
    } catch (error) {
      reject(error)
    }
  })
}

export function silentRemove(
  options: {
    inFile: string
    outFile: string
    /** @description nonSilentSections returned by silentDetect() or determined by custom logics */
    sections: Section[]
  } & ProgressArgs,
) {
  let { inFile, outFile, sections } = options
  return new Promise<void>(async (resolve, reject) => {
    try {
      let select = sections
        .map(section => {
          let start = section.start.toFixed(3).replace('.000', '')
          let end = section.end.toFixed(3).replace('.000', '')
          return `between(t,${start},${end})`
        })
        .join('+')
      let cmd = 'ffmpeg'
      let args = [
        '-i',
        inFile,
        '-vf',
        `select='${select}',setpts=N/FRAME_RATE/TB`,
        '-af',
        `aselect='${select}',asetpts=N/SR/TB`,
        outFile,
        '-y',
      ]
      let childProcess = spawn(cmd, args)
      await attachChildProcess({ childProcess, ...options })
      resolve()
    } catch (error) {
      reject(error)
    }
  })
}
