# CS470-LEAP-Carpooling

## Setup Instructions

1. Clone the repository
2. Install PostgreSQL
   - Mac: `brew install postgresql`
   - The rest: [postgresql.org](https://www.postgresql.org/download/)
3. After Postgres is installed, run `createdb` and name it `carpooldb`
4. Install `node` 13
   - Mac: `brew install node`
   - The rest: [nodejs.org](https://nodejs.org/en/download/current/)
2. Install `yarn`
   - Mac: `brew install yarn`
   - The rest: [yarnpkg.com](https://classic.yarnpkg.com/en/docs/install)
3. Run `yarn` to install dependencies (do this and the rest from the project directory)
4. Run `yarn migrate:latest` to configure your database tables
5. Run `yarn start` to run the server

You may receive errors referencing missing environment variables. `.env_template` will need to be copied as `.env` and modified appropriately.

# Google Maps

A project must be created at [console.cloud.google.com](https://console.cloud.google.com). Generate 1 key capable of using the Javascript Autocomplete APIs, and 1 key for the server side requests to the distance matrix.

# HTTPS

HTTPS is managed by separate software and doesn't interact with the code in this repository. Our deployment uses NGINX.

1. Install [NGINX](http://nginx.org/en/download.html) appropriately for your system
2. Install and configure [Certbot](https://certbot.eff.org/lets-encrypt/ubuntubionic-nginx)
3. Run certbot for the domain name of choice (carpool.cs.lafayette.edu currently), with the `certonly` option
3. Use configuration in `nginx/`, modify if the domain name was changed
