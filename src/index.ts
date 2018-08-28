import Program from './program'
import * as commander from 'commander'
import * as path from 'path'

new Program(commander, path.join(__dirname, '..'))
  .run(process.argv)
  .catch((err) => {
    console.error(err)
  })
