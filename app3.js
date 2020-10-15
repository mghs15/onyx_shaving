const config = require('config')
const fs = require('fs')
const express = require('express')

const cors = require('cors')
const morgan = require('morgan')
const MBTiles = require('@mapbox/mbtiles')
const TimeFormat = require('hh-mm-ss')
const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')

//vtshaver
//https://github.com/mapbox/vtshaver
const shaver = require('@mapbox/vtshaver');

const filterSet = {
  "test": {},
  "test1": {}
}

for(name in filterSet){
  console.log(name);
  let stylePath = './style/' + name + '.json'
  let style = require(stylePath);
  let filters = new shaver.Filters(shaver.styleToFilters(style));
  filterSet[name] = filters;
  
  console.log(shaver.styleToFilters(style));
  console.log(filters);
}

console.log(filterSet);


// config constants
const morganFormat = config.get('morganFormat')
const htdocsPath = config.get('htdocsPath')
const port = config.get('port') 
const hostname = config.get('hostname') //added
const defaultZ = config.get('defaultZ')
const mbtilesDir = config.get('mbtilesDir')
const logDirPath = config.get('logDirPath')

// global variables
let mbtilesPool = {}
let tz = config.get('tz')
let busy = false

// logger configuration
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: `${logDirPath}/onyx-%DATE%.log`,
      datePattern: 'YYYY-MM-DD'
    })
  ]
})

logger.stream = {
  write: (message) => { logger.info(message.trim()) }
}

// app
const app = express()
app.use(cors())
app.use(morgan(morganFormat, {
  stream: logger.stream
}))
app.use(express.static(htdocsPath))


const generateMbtilesName = (z, x, y) => {
  return "example"
}

const getMBTiles = async (t, z, x, y) => {
  let mbtilesPath = ''

  if (14 <= z && z <= 16) {
    const mbtileName = generateMbtilesName(z, x, y)
    mbtilesPath = `${mbtilesDir}/${mbtileName}.mbtiles`
  } else {
    throw new Error('1: Zoom level is out of range.')
  }
  
  console.log(mbtilesPath);
  
  return new Promise((resolve, reject) => {
    if (mbtilesPool[mbtilesPath]) {
      resolve(mbtilesPool[mbtilesPath].mbtiles)
    } else {
      if (fs.existsSync(mbtilesPath)) {
        new MBTiles(`${mbtilesPath}?mode=ro`, (err, mbtiles) => {
          if (err) {
            reject(new Error(`2: ${mbtilesPath} could not open.`))
          } else {
            mbtilesPool[mbtilesPath] = {
              mbtiles: mbtiles, openTime: new Date()
            }
            resolve(mbtilesPool[mbtilesPath].mbtiles)
          }
        })
      } else {
        reject(new Error(`3: ${mbtilesPath} was not found.`))
      }
    }
  })
}

const getTile = async (mbtiles, z, x, y) => {
  return new Promise((resolve, reject) => {
    mbtiles.getTile(z, x, y, (err, tile, headers) => {
      if (err) {
        reject()
      } else {
        resolve({tile: tile, headers: headers})
      }
    })
  })
}

app.get(`/xyz/:t/:z/:x/:y.pbf`, async (req, res) => {
  busy = true
  const t = req.params.t
  const z = parseInt(req.params.z)
  const x = parseInt(req.params.x)
  const y = parseInt(req.params.y)
  getMBTiles(t, z, x, y).then(mbtiles => {
    getTile(mbtiles, z, x, y).then(r => {
      if (r.tile) {
        
        const options = {
            filters: filterSet[t] ? filterSet[t] : filterSet["test"],  // required            
            zoom: z,          // required
            //maxzoom: 16,       // optional
            compress: {        // optional ['none'|'gzip']
                type: 'gzip'
            }
        };
        shaver.shave(r.tile, options, function(err, shavedTile) {
            if (err) throw err;
            console.log(shavedTile); // => vector tile buffer
            res.set('content-type', 'application/vnd.mapbox-vector-tile')
            res.set('content-encoding', 'gzip')
            res.set('last-modified', r.headers['Last-Modified'])
            res.set('etag', r.headers['ETag'])
            res.send(shavedTile)
            busy = false
        });
        
      } else {
        res.status(404).send(`4: tile not found: /xyz/${t}/${z}/${x}/${y}.pbf`)
        busy = false
      }
    }).catch(e => {
      res.status(404).send(`5: tile not found: /xyz/${t}/${z}/${x}/${y}.pbf`)
      busy = false
    })
  }).catch(e => {
    res.status(404).send(`6: mbtiles not found for /xyz/${t}/${z}/${x}/${y}.pbf`)
  })
})

const http = require('http')
const server = http.createServer(app)

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
