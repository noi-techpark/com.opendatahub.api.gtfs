import * as dotenv from 'dotenv'
import express from 'express'
import yaml from 'js-yaml'
import fs from 'fs'
import got from 'got'


dotenv.config()
const ds_config = yaml.load(fs.readFileSync('datasets.yml')).datasets
const app = express()
const port = process.env.APP_PORT

app.get('/dataset', (req, res) => {
  res.send('Hello World!')
})

app.get('/dataset/:dataset', (req, res) => {
  res.send(`${req.params.dataset}`)
})

app.get('/dataset/:dataset/raw', async (req, res) => {
  const dataset_id = req.params.dataset
  const raw = await got.get(ds_config[dataset_id]).buffer()
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-disposition': 'attachment;filename=' + dataset_id + '.zip',
    'Content-length': raw.length
  })
  res.end(raw)
})

app.listen(port, () => {
  console.log(`GTFS API listening on port ${port}`)
})