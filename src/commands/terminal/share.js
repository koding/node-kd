import KodingApi from 'koding-api'
import find from 'lodash.find'
import minimist from 'minimist'

export default {
  before(args, { run }) {
    const [, , identifier] = args
    const { username } = minimist(args)
    console.log('...', identifier, username)
    return run(['auth', 'show', '--json'])
      .then(result => {
        let auth = []
        try {
          auth = JSON.parse(result)
        } catch (e) {}
        return { auth }
      })
      .then(args => {
        return run(['machine', 'list', '--json']).then(result => {
          let machines = []
          try {
            machines = JSON.parse(result)
          } catch (e) {}
          return Object.assign({}, args, {
            username,
            machine: findMachine(machines, identifier),
          })
        })
      })
  },
  run(args, { run }) {
    console.log(args.auth.clientID)
    new KodingApi.JMachineApi(args.auth.clientID)
      .shareWith(args.machine.id, {
        target: [args.username],
        permanent: true,
        asUser: true,
      })
      .then(res => {
        console.log('success', res)
      })
      .catch(err => {
        console.log('error', err.message)
      })
  },
}

const findMachine = (machines, identifier) =>
  find(
    machines,
    machine =>
      machine.alias === identifier ||
      machine.id === identifier ||
      machine.label === identifier
  )
