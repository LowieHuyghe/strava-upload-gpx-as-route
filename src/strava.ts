import * as puppeteer from 'puppeteer'

export default class Strava {
  protected browser?: puppeteer.Browser

  protected async getBrowser () {
    if (!this.browser) {
      this.browser = await puppeteer.launch()
    }
    return this.browser
  }

  protected async getPage () {
    const browser = await this.getBrowser()
    return browser.newPage()
  }

  async login (username: string, password: string, callback: (description: string) => void) {
    const page = await this.getPage()

    try {
      callback('Logging in')
      await page.goto('https://www.strava.com/login')
      await page.type('form#login_form input#email', username)
      await page.type('form#login_form input#password', password)
      await page.click('form#login_form input#remember_me')
      await page.click('form#login_form button#login-button')
      await page.waitForNavigation()

      if (/\/login/.test(page.url())) {
        throw new Error('Failed to login')
      }
      callback('Logged in')
    } catch (e) {
      await page.screenshot({ path: 'woopsLogin.jpg', fullPage: true })
      throw e
    } finally {
      await page.close()
    }
  }

  async createRoute (inputFile: string, callback?: (description: string) => void) {
    callback('Saving activity')
    const activityId = await this.saveActivity(inputFile)
    callback('Saved activity')

    try {
      callback('Saving route')
      await this.createRouteFromActivity(activityId)
      callback('Saved route')
    } finally {
      callback('Deleting activity')
      await this.deleteActivity(activityId)
      callback('Deleted activity')
    }
  }

  protected async saveActivity (inputFile: string): Promise<string> {
    const page = await this.getPage()

    try {
      await page.goto('https://www.strava.com/upload/select')
      const fileInput = await page.$('form input.files')
      await fileInput.uploadFile(inputFile)
      const saveAndViewButton = await page.waitForSelector('#uploadFooter button.save-and-view:not(.disabled)', { visible: true })
      await saveAndViewButton.click()
      await page.waitForNavigation()

      const activityUrl = page.url()
      return /activities\/(\d+)/.exec(activityUrl)[1]
    } catch (e) {
      await page.screenshot({ path: 'woopsSaveActivity.jpg', fullPage: true })
      throw e
    } finally {
      await page.close()
    }
  }

  protected async createRouteFromActivity (activityId: string) {
    const page = await this.getPage()
    page.on('dialog', (dialog) => {
      console.error(`Unexpected dialog with message "${dialog.message()}"`)
      dialog.accept()
    })

    try {
      await page.goto(`https://www.strava.com/activities/${activityId}/route`)
      const saveRouteButton = await page.waitForSelector('.button.save-route:not(.disabled)', { visible: true })
      await saveRouteButton.click()
      const confirmSaveRouteButton = await page.waitForSelector('#save-content .button.submit:not(.disabled)', { visible: true })
      await confirmSaveRouteButton.click()
      await page.waitForSelector('#save-content .result', { visible: true })
    } catch (e) {
      await page.screenshot({ path: 'woopsCreateRouteFromActivity.jpg', fullPage: true })
      throw e
    } finally {
      await page.close()
    }
  }

  protected async deleteActivity (activityId: string) {
    const page = await this.getPage()
    page.on('dialog', (dialog) => {
      dialog.accept()
    })

    try {
      await page.goto(`https://www.strava.com/activities/${activityId}`)
      await page.click('.actions-menu .slide-menu')
      const deleteButton = await page.waitForSelector('.actions-menu .slide-menu ul.options a[data-method=delete]', { visible: true })
      await deleteButton.click()
      await page.waitForNavigation()
    } catch (e) {
      await page.screenshot({ path: 'woopsDeleteActivity.jpg', fullPage: true })
      throw e
    } finally {
      await page.close()
    }
  }

  async close () {
    if (this.browser) {
      await this.browser.close()
    }
  }
}
