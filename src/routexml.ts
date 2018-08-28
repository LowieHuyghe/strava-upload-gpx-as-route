import * as xml2js from 'xml2js'
import * as geolib from 'geolib'
import * as path from 'path'
import * as fs from 'fs'

export default class RouteXml {
  protected inputFile: string

  constructor (inputFile: string) {
    this.inputFile = inputFile
  }

  async process (outputFile: string) {
    const inputXml = await this.readXml(this.inputFile)

    let outputXml: any
    if (inputXml.gpx) {
      outputXml = this.processGpx(inputXml)
    } else {
      throw new Error(`File "${this.inputFile}" is not supported`)
    }

    await this.writeXml(outputFile, outputXml)
  }

  protected async readXml (inputFile: string): Promise<any> {
    if (!fs.existsSync(inputFile)) {
      throw new Error(`File "${inputFile}" does note exist`)
    }
    if (path.extname(inputFile) !== '.gpx') {
      throw new Error(`File "${inputFile}" is not of extension .gpx`)
    }

    const inputContent = fs.readFileSync(inputFile)
    return new Promise<any>((resolve, reject) => {
      xml2js.parseString(inputContent, (err, content) => {
        if (err) {
          reject(err)
        } else {
          resolve(content)
        }
      })
    })
  }

  protected async writeXml (outputFile: string, outputXml: any) {
    const outputContent = new xml2js.Builder().buildObject(outputXml)
    fs.writeFileSync(outputFile, outputContent)
  }

  protected processGpx (inputXml: { gpx: any }): { gpx: any } {
    const trackPoints = []
    for (const track of inputXml.gpx.trk) {
      for (const trackSegment of track.trkseg) {
        trackPoints.push(...trackSegment.trkpt)
      }
    }

    let nextDate: Date | undefined
    for (let i = trackPoints.length - 1; i >= 0; --i) {
      const currentPoint = trackPoints[i]
      const nextPoint = trackPoints[i + 1]

      if (!nextDate) {
        nextDate = new Date(new Date().getTime() - 3600)
        currentPoint.time = nextDate.toISOString()
      } else {
        const meters = geolib.getDistance({ latitude: currentPoint.$.lat, longitude: currentPoint.$.lon }, { latitude: nextPoint.$.lat, longitude: nextPoint.$.lon })
        const timeToTravelInMilliseconds = meters / 25000 * 3600 * 1000
        nextDate = new Date(Date.parse(nextPoint.time) - timeToTravelInMilliseconds)
        currentPoint.time = nextDate.toISOString()
      }
    }

    return inputXml
  }
}
