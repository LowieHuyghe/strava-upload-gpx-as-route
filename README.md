# Strava upload GPX as Route

Tool to upload GPX-files as Strava Routes. Alternative for
[https://labs.strava.com/gpx-to-route](https://labs.strava.com/gpx-to-route)
as the tool does not work.
> Note: Strava seems to have problems with creating long routes. See
[https://support.strava.com/hc/en-us/community/posts/211820068-Route-Builder-Error](https://support.strava.com/hc/en-us/community/posts/211820068-Route-Builder-Error)


## Important

Usage of this code is at own risk. Asked username and password are
not saved and are merely used for uploading the route.


## Usage

Clone the repository
```bash
git clone https://github.com/LowieHuyghe/strava-upload-gpx-as-route.git
```

Move into the new directory
```bash
cd strava-upload-gpx
```

Install javascript dependencies
```bash
npm install
```

Start uploading
```bash
npm start
npm start -- -i /PATH/TO/YOUR/GPX-FILE.gpx
```
