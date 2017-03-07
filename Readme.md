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

1) Add `someCommandName.js` under `/src/commands` folder.

```js
// commands/init.js

// let's assume we are trying to create a new command
// named `kdx init` (not present in original kd tool)

export default {
  run(args, { run }) {
    console.log('running init command')
    askTeamAndBaseUrl().then(({baseurl, team}) => {
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

2) Update `/src/commands/index.js` to export new command.

```js
// other command imports
// ...

import init from './'

export default {
  // other command exports
  // ...

  'init': init
}
```

3) Try your command:

```bash
cd /your/node-kd/path
npm run run-cli -- init
=> running init command
```

or with `npm link`

```bash
cd /your/node-kd/path
npm link

kdx init
=> running init command
```


