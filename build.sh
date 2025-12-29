#!/bin/bash

docker-compose down
git pull
docker image rm slc-ai-tutor-app_slc-app
docker builder prune
docker-compose build slc-app
docker-compose up -d
