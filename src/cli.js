import KD from './'
import requireAll from 'require-all'
import ensure from './ensure'

const args = process.argv.slice(2)

const commands = requireAll({
  dirname: `${__dirname}/commands`,
  resolve: command => command.default,
})

const kd = KD({
  commands: commands
})

ensure(args)
  .then(() => kd.run(args))
  .then(console.log.bind(console))
  .catch(console.error.bind(console))

