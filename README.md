<!--
SPDX-FileCopyrightText: NOI Techpark <digital@noi.bz.it>

SPDX-License-Identifier: CC0-1.0
-->

# GTFS API server

![REUSE Compliance](https://github.com/noi-techpark/com.opendatahub.api.gtfs/actions/workflows/reuse.yml/badge.svg)

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

## REUSE

This project is [REUSE](https://reuse.software) compliant, more information about the usage of REUSE in NOI Techpark repositories can be found [here](https://github.com/noi-techpark/odh-docs/wiki/Guidelines-for-developers-and-licenses#guidelines-for-contributors-and-new-developers).

Since the CI for this project checks for REUSE compliance you might find it useful to use a pre-commit hook checking for REUSE compliance locally. The [pre-commit-config](.pre-commit-config.yaml) file in the repository root is already configured to check for REUSE compliance with help of the [pre-commit](https://pre-commit.com) tool.

Install the tool by running:
```bash
pip install pre-commit
```
Then install the pre-commit hook via the config file by running:
```bash
pre-commit install
```