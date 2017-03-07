import KD from './'
import commands from './commands'

const kd = KD({
  commands: commands
})


kd.run(process.argv.slice(2))
  .then(console.log.bind(console))
  .catch(console.error.bind(console))

