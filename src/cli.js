import KD from './'
import ensure from './ensure'
import resolveCommands from './resolve-commands'

const args = process.argv.slice(2)

resolveCommands()
  .then(commands => {
    const kd = KD({ commands })
    return ensure(args).then(() => kd.run(args))
  })
  .then(console.log.bind(console))
  .catch(console.error.bind(console))
