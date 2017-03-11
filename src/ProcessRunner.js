import child_process from 'child_process'
import { Buffer } from 'buffer'
import set from 'lodash.set'
import get from 'lodash.get'


export default class ProcessRunner {

  constructor(options) {
    this.command = options.name
    this.dir = options.dir
    this.queue = []
    this._process = null
    this._subcommands = options.commands || {}
  }

  set(path, value) {
    set(this._subcommands, path, value)
    return this
  }

  get(path) {
    return get(this._subcommands, path) || {}
  }

  cmd(subcmd, options) {
    this.set(subcmd.split(' '), options)
  }

  getCommand(args) {
    for (let i = 0, ll = args.length; i < ll; i++) {
      const path = args.slice(0, ll - i)
      const cmd = this.get(path)

      if (isCmd(cmd)) {
        return cmd
      }
    }

    return {}
  }

  run(args) {
    const command = this.getCommand(args)

    const { before, run, after } = command

    const _run = this.run.bind(this)

    return Promise.resolve(args)
      .then(args => {
        return before ? before(args, { run: _run }) : args
      })
      .then(args => {
        if (run) {
          return run(args, { run: _run })
        }
        this.queue.push(args)
        return this.schedule()
      })
      .then(result => {
        return after
          ? after(result, { run: _run })
          : result
      })
  }

  schedule() {
    return new Promise((resolve, reject) => {
      if (!this.isRunning() && this.queue.length) {
        const command = this.queue.shift()

        const stdOut = []
        const stdErr = []

        let spawned = child_process.spawn(this.command, command, {
          cwd: this.dir
        })

        spawned.stdout.on('data', function (buffer) {
          stdOut.push(buffer)
        })
        spawned.stderr.on('data', function (buffer) {
          stdErr.push(buffer)
        })

        spawned.on('error', function (err) {
          stdErr.push(new Buffer(err.stack, 'ascii'))
        })

        spawned.on('close', (exitCode, exitSignal) => {
          this.setProcess(null)

          if (exitCode && stdErr.length) {
            const errOutput = Buffer.concat(stdErr).toString('utf-8')
            this.queue = []
            reject(errOutput)
          }
          else {
            const stdOutput = Buffer.concat(stdOut).toString('utf-8')
            resolve(stdOutput)
          }

          process.nextTick(() => this.schedule())
        })

        this.setProcess(spawned)
      }
    })
  }

  isRunning() {
    return !!this._process
  }

  setProcess(p) {
    this._process = p
    return this
  }

}

const toArray = thing => {
  return Object.keys(thing).reduce((arr, key) => {
    const value = thing[key]

    if (key === '_') {
      return arr.concat(value)
    }

    if (value === Boolean(value)) {
      return arr.concat([`--${key}`])
    }

    return arr.concat([`--${key}=${value}`])
  }, [])
}

const toString = thing => {
  return Object.keys(thing).reduce((str, key) => {
    const value = thing[key]

    if (key === '_') {
      return `${str} ${value.join(' ')}`
    }

    if (value === Boolean(value)) {
      return `${str} --${key}`
    }

    return `${str} --${key}=${value}`

  }, '')
}

const isCmd = cmd => cmd && (cmd.run || cmd.before || cmd.after)

