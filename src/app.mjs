// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as dotenv from 'dotenv'
import express, { Router } from 'express'
import yaml from 'js-yaml'
import fs from 'fs'
import got from 'got'
import pino from 'pino-http'
import URL from 'url'

import { getFile } from "@tpisto/ftp-any-get"


dotenv.config()
const ds_config = yaml.load(fs.readFileSync('datasets.yml')).datasets
const app = express()
const router = Router()
const port = 3000

function assemble_metadata(id, e){
  return {
    description: e.description,
    endpoint: `${process.env.API_BASE_URL}/v1/dataset/${id}/raw`,
    origin: e.origin,
    license: e.license,
    metadata: e.metadata
  } 
}

function error(res, status, msg) {
  res.status(status)
  res.send({error: msg})
}

router.get('/dataset', (req, res) => {
  res.json(Object.fromEntries(
    Object.entries(ds_config)
      .map(([k, v]) => [k, assemble_metadata(k, v)])))
})

router.get('/dataset/:dataset', (req, res) => {
  const dataset_id = req.params.dataset
  const config = ds_config[dataset_id]
  if (!config){
    return error(res, 404, `Dataset ${dataset_id} not found!`)
  }
  res.json(assemble_metadata(dataset_id, config))
})

const getters = {
  'http': (uri) => got.get(uri).buffer(),
  'https': (uri) => got.get(uri).buffer(),
  'ftp': (uri) => getFile(uri)
}

router.get('/dataset/:dataset/raw', async (req, res) => {
  const dataset_id = req.params.dataset
  const dataset_config = ds_config[dataset_id]
  if (!dataset_config){
    return error(res, 404, `Dataset ${dataset_id} not found!`)
  }
  const uri = dataset_config.source

  const proto = uri.match(/^(\w+):.*/)[1].toLowerCase() // extract the protocol part of an URL
  const handler = getters[proto]

  const raw = await handler(uri)
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-disposition': 'attachment;filename=' + dataset_id + '.zip',
    'Content-length': raw.length
  })
  res.end(raw)
})

app.use(pino())
app.set('trust proxy')
app.use('/v1/', router) // use v1 prefix for all URLs
app.listen(port, () => {
  console.log(`GTFS API listening on port ${port}`)
})