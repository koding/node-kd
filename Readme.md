node-kd
=======

A thin node.js wrapper around `kd` cli tool.

### What?

It's designed to be an extension layer on top of `kd` so that one could extend the functionality of each commands.

```bash
npm install --global kd

# it exposes a `kdx` binary.
kdx auth login
# => same as running kd auth login
```


## Extending `kd`

1) To match `kdx your command` create a file under `src/commands/your/command.js`

```js
// commands/example/init.js

// this command will run when we type `kdx example init`

export default {
  run(args, { run }) {
    console.log('running init command')

    return askTeamAndBaseUrl().then(({baseurl, team}) => {
      return run(
        ['auth', 'login', '--baseurl', baseurl, '--team', team]
      )
    })
    .then(() => {
      return run(
        ['template', 'create']
      )
    })
  }
}

```

a command is a simple object containing the following keys:
- `before(initialArgs: Array<String>, { run: Function }) => args: Promise<Array<String>>`

  Accepts initial args, and it's expected to return an array to be passed to the `run` function as `args`. If return value is a promise, the resolved value will be passed to `run` function.

    - **tl;dr:** Return a promise if you need to do async stuff.

- `run(args: <Array<String>>, { run: Function }) => Promise`

  A function accepts the result of `before` function. If `before` function doesn't exist, it will be passed the original args.

- `after(result: any) => Promise`

  A function accepts the result of `run` function.

**IMPORTANT**: You **HAVE TO** return either an array or a Promise which will return an array from `before` function. This result will either be passed to `run` function of the command if defined, or to the main `kd` command you are wrapping.

2) Try your command:

```bash
cd /your/node-kd/path
npm run run-cli -- example init
# => running init command
```

or with `npm link`

```bash
cd /your/node-kd/path
npm link

kdx example init
# => running init command
```

3) Add functionality to an existing command:

```js
// file => src/commands/template/create.js
// cmd => kdx template create

export default {

  before(args) {

    console.log(' before template create ')

    return args
  }

  after(result) {

    console.log(' after template create ')

    return args
  }

}
```

run in terminal:

```bash
kdx template create
# => before template create
# => ...
# => ...
# => ... (running kd template create)
# => ...
# => ...
# => after template create
```

Since we didn't create a `run` function in `src/commands/template/create.js` it didn't override the main functionality of `kd template create`; it just ran `before(args)` before and `after(result)` after it.

