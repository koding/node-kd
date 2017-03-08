export default {
  before(args) {
    console.log(`

      Before 'kd auth login'

    `)
    return args
  }
}
