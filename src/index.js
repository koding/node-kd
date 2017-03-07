import ProcessRunner from './ProcessRunner'

export default (config) =>
  new ProcessRunner(Object.assign({
    name: 'kd',
    dir: process.cwd()
  }, config))
