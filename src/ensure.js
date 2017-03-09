import exists from 'command-exists'
import os from 'os'
import ProcessRunner from './ProcessRunner'
import ora from 'ora'
import { prompt } from 'inquirer'

const ensure = (args) => {
  if (os.platform() !== 'darwin') {
    return Promise.reject('Only macOS is supported.')
  }

  if (exists.sync('kd')) {
    return Promise.resolve()
  }

  if (exists.sync('brew')) {
    const runner = new ProcessRunner({
      name: 'brew',
      dir: process.cwd()
    })

    const spinner = ora('Running `brew tap rjeczalik/kd`')
    return Promise.resolve()
      .then(() => showWelcomeMessage())
      .then(() => askForPermission())
      .then(() => spinner.start())
      .then(() => runner.run(['tap', 'rjeczalik/kd']))
      .then(() => spinner.text = 'Running `brew install kd --devel`')
      .then(() => runner.run(['install', 'kd', '--devel']))
      .then(() => runner.run(['link', 'kd']))
      .then(() => spinner.succeed('kd installed successfully'))
      .then(() => console.log(`running kd ${args.join(' ')}`))
      .then(() => Promise.resolve(args))
  }

  return Promise.reject('You need to install Homebrew first.')
}

const showWelcomeMessage = () => {
  console.log(`

    Welcome to KDX!

  `)
}

const askForPermission = () => {
  return prompt([{
    type: 'confirm',
    name: 'allowed',
    message: '`kd` is missing in your system. Do you want to install?' }
  ]).then(({ allowed }) => allowed ? Promise.resolve() : Promise.reject('Aborted'))
}

export default ensure
