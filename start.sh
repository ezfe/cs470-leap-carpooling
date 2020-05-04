#!/bin/bash

# This file will ensure your database is migrated and then
# build and run the server. It should be run consistently
# from the same user, since it will result in file system
# changes. It is designed to go hand-in-hand with the
# systemd service provided in `services/carpool.service`.

yarn
yarn migrate:latest
yarn run start
