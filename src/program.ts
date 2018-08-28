import * as commander from 'commander'
import * as path from 'path'
import * as readlineSync from 'readline-sync'
import * as fs from 'fs'
import Strava from './strava'
import RouteXml from './routexml'

export default class Program {
  /**
   * Command
   */
  private command: commander.Command
  /**
   * Root directory
   */
  private root: string

  /**
   * Constructor
   * @param {commander.Command} command
   * @param {string} root
   */
  constructor (command: commander.Command, root: string) {
    this.command = command
      .name('Upload GPX to Strava')
      .version('0.1.0')
      .usage('--input <inputFile> [options]')
      .option('-i, --inputFile [inputFile]', 'Input file')
      .option('-u, --username [username]', 'Strava username')
    this.root = root
  }

  /**
   * Run the program
   * @param {string[]} argv
   */
  async run (argv: string[]): Promise<void> {
    this.command.parse(argv)

    if (this.command.inputFile && typeof this.command.inputFile === 'string') {
      await this.action(this.command.inputFile, this.command.username)
    } else {
      this.command.outputHelp()
      process.exit(1)
    }
  }

  /**
   * Action
   * @param {string} inputFile
   * @param {string} givenUsername
   */
  protected async action (inputFile: string, givenUsername?: string) {
    const outputFile = `${inputFile}.processed${path.extname(inputFile)}`

    const xml = new RouteXml(inputFile)
    await xml.process(outputFile)

    const strava = new Strava()

    try {
      const username = givenUsername || readlineSync.question('Strava username? ')
      const password = readlineSync.question('Strava password? ', { hideEchoBack: true })
      await strava.login(username, password, console.log)
      await strava.createRoute(outputFile, console.log)
    } finally {
      await strava.close()
      fs.unlinkSync(outputFile)
    }
  }
}
