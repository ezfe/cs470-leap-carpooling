# CS470-LEAP-Carpooling

![Node Linter](https://github.com/ezfe/cs470-leap-carpooling/workflows/Node%20Linter/badge.svg)

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
