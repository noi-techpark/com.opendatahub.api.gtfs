// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as dotenv from 'dotenv'
import express, { Router } from 'express'
import yaml from 'js-yaml'
import fs from 'fs'
import got from 'got'
import pino from 'pino-http'

import { getFile } from "@tpisto/ftp-any-get"


dotenv.config()
const ds_config = yaml.load(fs.readFileSync('datasets.yml')).datasets
const app = express()
const router = Router()
const port = 3000

function assemble_metadata(e){
  return {
    description: e.description,
    origin: e.origin,
    license: e.license,
    metadata: e.metadata
  } 
}

router.get('/dataset', (req, res) => {
  res.json(Object.fromEntries(
    Object.entries(ds_config)
      .map(([k, v]) => [k, assemble_metadata(v)])))
})

router.get('/dataset/:dataset', (req, res) => {
  res.json(assemble_metadata(ds_config[req.params.dataset]))
})

const getters = {
  'http': (uri) => got.get(uri).buffer(),
  'https': (uri) => got.get(uri).buffer(),
  'ftp': (uri) => getFile(uri)
}

router.get('/dataset/:dataset/raw', async (req, res) => {
  const dataset_id = req.params.dataset
  const uri = ds_config[dataset_id].source

  const proto = uri.match(/^(\w+):.*/)[1].toLowerCase() // extract the protocol part of an URL
  const raw = await getters[proto](uri)
  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-disposition': 'attachment;filename=' + dataset_id + '.zip',
    'Content-length': raw.length
  })
  res.end(raw)
})

app.use(pino())
app.use('/v1/', router) // use v1 prefix for all URLs
app.listen(port, () => {
  console.log(`GTFS API listening on port ${port}`)
})