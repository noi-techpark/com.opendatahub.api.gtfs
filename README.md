# GTFS API server
This is a simple POC MVP of what could be the Open Data Hub GTFS API

Goal is to provide a single access point where Open Data Hub users can discover and download GTFS files and some metadata related to them

The API is a simple storage-less frontend to GTFS files hosted somewhere else (primarily on a S3 bucket)

API proposal can be found [here](https://github.com/noi-techpark/it.bz.opendatahub.api.mobility-ninja/discussions/34)

## Installation
`docker-compose up` to start your local development environment

if you don't want to use docker, try
`npm install`
`npm run dev`

## Dataset configuration
Datasets are configured in datasets.yml