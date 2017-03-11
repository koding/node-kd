import path from 'path'
import gitDir from 'git-toplevel'
import homeDir from 'homedir'
import pathExists from 'path-exists'
import requireAll from 'require-all'

const COMMANDS_PATH = '.kd/commands'
const extend = Object.assign.bind(null, {})

export default () => {
  return resolvePaths().then(paths => {
    return extend(req(paths.global), req(paths.user), req(paths.local))
  })
}

const req = dirname => {
  if (!pathExists.sync(dirname)) {
    return {}
  }

  return requireAll({
    dirname,
    resolve: cmd => cmd.default ? cmd.default : cmd,
  })
}

const projectDir = () => {
  return new Promise(resolve => {
    return gitDir().then(resolve).catch(err => resolve(null))
  })
}

const resolvePaths = () => {
  return Promise.all([
    projectDir(),
    Promise.resolve(homeDir()),
    Promise.resolve(__dirname),
  ]).then(([project, home, globals]) => {
    let paths = {
      user: path.join(home, COMMANDS_PATH),
      global: path.join(globals, 'commands'),
    }

    if (project) {
      paths.local = path.join(project, COMMANDS_PATH)
    }

    return paths
  })
}
