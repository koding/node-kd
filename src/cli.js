import KD from './'
import requireAll from 'require-all'

const commands = requireAll({
  dirname: `${__dirname}/commands`,
  resolve: command => command.default,
})

const kd = KD({
  commands: commands
})

kd.run(process.argv.slice(2))
  .then(console.log.bind(console))
  .catch(console.error.bind(console))

