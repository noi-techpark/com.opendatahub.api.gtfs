// SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>
//
// SPDX-License-Identifier: AGPL-3.0-or-later

import * as dotenv from 'dotenv'
import express, { Router } from 'express'
import yaml from 'js-yaml'
import fs from 'fs'
import got from 'got'
import pino from 'pino-http'
import NodeCache from 'node-cache'

import { getFile } from '@tpisto/ftp-any-get'

dotenv.config()
const datastoreConfigs = yaml.load(fs.readFileSync('datasets.yml')).datasets
const app = express()
const router = Router()
const port = 3000
const cache = new NodeCache()
const pino = pino({ level: process.env.LOG_LEVEL })

function assembleMetadata (id, e) {
  return {
    description: e.description,
    endpoint: `${process.env.API_BASE_URL}/v1/dataset/${id}/raw`,
    origin: e.origin,
    license: e.license,
    metadata: e.metadata
  }
}

function error (res, status, msg) {
  res.status(status)
  res.send({ error: msg })
}

router.get('/dataset', (req, res) => {
  res.json(Object.fromEntries(
    Object.entries(datastoreConfigs)
      .map(([k, v]) => [k, assembleMetadata(k, v)])))
})

router.get('/dataset/:dataset', (req, res) => {
  const datasetId = req.params.dataset
  const config = datastoreConfigs[datasetId]
  if (!config) {
    return error(res, 404, `Dataset ${datasetId} not found!`)
  }
  res.json(assembleMetadata(datasetId, config))
})

const protocolHandlers = {
  http: (uri) => got.get(uri).buffer(),
  https: (uri) => got.get(uri).buffer(),
  ftp: (uri) => getFile(uri)
}

router.get('/dataset/:dataset/raw', async (req, res) => {
  const datasetId = req.params.dataset
  const datasetConfig = datastoreConfigs[datasetId]
  if (!datasetConfig) {
    return error(res, 404, `Dataset ${datasetId} not found!`)
  }

  let rawGTFS = cache.get(datasetId)
  if (!rawGTFS) {
    const uri = datasetConfig.source
    const proto = uri.match(/^(\w+):.*/)[1].toLowerCase() // extract the protocol part of an URL
    const handler = protocolHandlers[proto]
    rawGTFS = await handler(uri)
    cache.set(datasetId, rawGTFS, datasetConfig.cache_ttl)
  }

  res.writeHead(200, {
    'Content-Type': 'application/zip',
    'Content-disposition': 'attachment;filename=' + datasetId + '.zip',
    'Content-length': rawGTFS.length
  })
  res.end(rawGTFS)
})

app.use(pino)
app.set('trust proxy')
app.use('/v1/', router) // use v1 prefix for all URLs
app.listen(port, () => {
  console.log(`GTFS API listening on port ${port}`)
})
