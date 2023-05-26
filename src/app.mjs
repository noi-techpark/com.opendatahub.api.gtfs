import * as dotenv from 'dotenv'
import express from 'express'
import yaml from 'js-yaml'
import fs from 'fs'
import got from 'got'
import pino from 'pino-http'

dotenv.config()
const ds_config = yaml.load(fs.readFileSync('datasets.yml')).datasets
const app = express()
const port = 3000

app.use(pino())

function config_to_meta(e){
  return {
    source: e.source,
    description: e.description,
    origin: e.origin,
    license: e.license,
    metadata: e.metadata
  } 
}

app.get('/dataset', (req, res) => {
  res.json(Object.fromEntries(
    Object.entries(ds_config)
      .map(([k, v]) => [k, config_to_meta(v)])))
})

app.get('/dataset/:dataset', (req, res) => {
  res.json(config_to_meta(ds_config[req.params.dataset]))
})

app.get('/dataset/:dataset/raw', async (req, res) => {
  const dataset_id = req.params.dataset
  const raw = await got.get(ds_config[dataset_id].source).buffer()
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