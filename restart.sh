#!/bin/bash

git pull
yarn
yarn migrate:latest
yarn tsc
sudo systemctl restart carpool

