import { startTimer } from '@beenotung/tslib/timer'
import { silentDetectAndRemove } from '.'
import { parseToSeconds } from 'ffmpeg-progress'

let { version } = require('../package.json')

let inFile = ''
let outFile = ''
let durationThreshold = 1 // Default 1 second
let noiseLevelThreshold = -50 // Default -50 dB

function printHelp() {
  console.log(
    `
Usage: silentremove-ffmpeg [options] <output file>

Options:
  -i, --input <file>               Input file path (required)
  -d, --duration-threshold <sec>   Duration threshold in seconds (default: 1)
  -n, --noise-level-threshold <dB> Noise level threshold in dB (default: -50)
  -v, --version                    Show the version number
  -h, --help                       Show this help message

Examples:
  # Using default duration (1 second) and noise level (-50 dB) thresholds
  silentremove-ffmpeg -i in.mp4 out.mp4

  # Custom thresholds: 1.5 seconds of silence and -40 dB noise level
  silentremove-ffmpeg --input in.mp4 --duration-threshold 1.5 --noise-level-threshold -40 out.mp4

  # Fast-paced cutting: detect silence shorter than 0.2 seconds and noise below -40 dB
  silentremove-ffmpeg out.mp4 -i in.mp4 -n -40 -d 0.2
`.trim(),
  )
}

function failure(): never {
  console.error(
    `Hint: run "silentremove-ffmpeg --help" to see available options and examples.`,
  )
  process.exit(1)
}

for (let i = 2; i < process.argv.length; i++) {
  let arg = process.argv[i]
  switch (arg) {
    case '-i':
    case '--input':
      inFile = process.argv[++i]
      if (!inFile) {
        console.error('Error: missing input file in argument')
        process.exit(1)
      }
      break

    case '-d':
    case '--duration-threshold':
      durationThreshold = parseInt(process.argv[++i], 10)
      if (isNaN(durationThreshold)) {
        console.error('Error: invalid duration threshold')
        process.exit(1)
      }
      break

    case '-n':
    case '--noise-level-threshold':
      noiseLevelThreshold = parseFloat(process.argv[++i])
      if (isNaN(noiseLevelThreshold)) {
        console.error('Error: invalid noise level threshold')
        process.exit(1)
      }
      break

    case '-v':
    case '--version':
      console.log(`silentremove-ffmpeg v${version}`)
      process.exit(0)

    case '-h':
    case '--help':
      printHelp()
      process.exit(0)

    default:
      if (!outFile) {
        outFile = arg
        break
      }

      console.error(`Error: unknown argument "${arg}"`)
      failure()
  }
}

if (!inFile) {
  console.error('Error: input file not specified')
  failure()
}

if (!outFile) {
  console.error('Error: output file not specified')
  failure()
}

async function main() {
  let timer = startTimer('detect silent clips')
  await silentDetectAndRemove({
    inFile,
    outFile,
    durationThreshold,
    noiseLevelThreshold,
    onSilentDetectDuration(duration) {
      timer.setEstimateProgress(parseToSeconds(duration))
    },
    onSilentDetectProgress(args) {
      timer.tick(args.deltaSeconds)
    },
    onSilentRemoveDuration(duration) {
      timer.next('remove silent clips')
      timer.setEstimateProgress(parseToSeconds(duration))
    },
    onSilentRemoveProgress(args) {
      timer.tick(args.deltaSeconds)
    },
  })
  timer.end()
}

main().catch(e => console.error(e))
