# CS470-LEAP-Carpooling

## Setup Guide

This guide was tested on a clean Ubuntu 18.04.3 LTS (x64) container from Digital Ocean. It assumes that you're able to SSH into the server, but haven't done any setup work on the server itself.

If you don't have an Ubuntu/Linux based system, then install the same software but find instructions online for your specific platform. Verify you've installed the right version using the same steps shown in these instructions.

1. Connect to the server via SSH

2. Update your package manager and any outdated packages:
   ```bash
   $ sudo apt update
   $ sudo apt upgrade -y
   ```

3. This manual assumes that `git` is installed. If you do not have `git`, install it now.
   ```bash
   # Verify git is installed
   git --version
   # git version 2.17.1
   ```

4. Install Node.js and Yarn
   ```bash
   # Configure Nodesource
   cd ~
   curl -sL https://deb.nodesource.com/setup_13.x -o nodesource_setup.sh
   sudo bash nodesource_setup.sh

   # Install Node.js
   sudo apt install -y nodejs

   # Install Yarn
   curl -sL https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
   echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
   sudo apt update && sudo apt install yarn

   # Verify Node.js version
   node -v
   # v13.14.0

   # Verify Yarn version
   yarn -v
   # 1.22.4
   ```

5. Install PostgreSQL
   ```bash
   sudo apt install postgresql postgresql-contrib
   ```

6. Configure PostgreSQL
   
   You will be creating a Postgres user and database, as well as a Linux user with the same name, to store the data.
   
   If you prefer not to follow these exact steps, simply assure you have a username, password, and database that work to access Postgres.

   ```bash
   # Switch to Postgres account
   sudo -i -u postgres

   # Create a new user
   # The user will be assumed to
   # be called `carpool` for the remainer
   # of this document.
   createuser --interactive

   # Create a database
   # The database name of `carpooldb` is
   # also your preference, however that name
   # will be assumed as well.
   createdb carpooldb

   # Exit the `postgres` account
   logout

   # Create a linux user to access the account
   # You will need to provide a password, other
   # fields can be left blank
   sudo adduser carpool

   # Login to the new account and access the database
   # If this does not open a Postgres prompt,
   # address the error shown before continuing
   sudo -i -u carpool
   psql -d carpooldb

   # Set a password while in the Postgres prompt
   \password

   # Exit the Postgres prompt with `control+d`

   # Exit the `carpool` linux account
   logout
   ```

7. Install Redis
   ```bash
   # Install Redis
   sudo apt install -y redis-server

   # Test Redis
   redis-cli

   # You should now be in a redis prompt, exit it
   # with `control+d`
   ```

8. Configure Redis
   
   Open `/etc/redis/redis.conf` with the text editor of your choice, and scroll down to the section that looks like this:

   ```
   # If you run Redis from upstart or systemd, Redis can interact with your
   # supervision tree. Options:
   #   supervised no      - no supervision interaction
   #   supervised upstart - signal upstart by putting Redis into SIGSTOP mode
   #   supervised systemd - signal systemd by writing READY=1 to $NOTIFY_SOCKET
   #   supervised auto    - detect upstart or systemd method based on
   #                        UPSTART_JOB or NOTIFY_SOCKET environment variables
   # Note: these supervision methods only signal "process is ready."
   #       They do not enable continuous liveness pings back to your supervisor.
   supervised no
   ```

   On Ubuntu, change `no` to `systemd`. This improves the ability for `systemd` to control redis. This step does not appear to be mandatory to continue setup.

   While in the configuration file, ensure that the following line is **not** commented out and appears in the file. This prevents redis from being accessed directly from outside the network.

   `bind 127.0.0.1 ::1`

9. Clone the repository and configure the environment files.

   If you are using a different account from your administrator account to run the Carpool project, switch to it. Starting with this step, the rest of the setup process should take place in that account except where explicitly stated.

   ```bash
   # Modify the URL and folder name appropriately if you're cloning
   # from a different source
   git clone https://github.com/ezfe/cs470-leap-carpooling.git
   cd cs470-leap-carpooling

   # Copy the template environment file
   cp .env_template .env
   ```

   You will now need to fill in the environment variable values appropriately. Most values will be filled appropriately for this setup document, however you will need to configure some:

   - `PGPASSWORD`: The password to login to the Postgres account
   - `SESSION_SECRET`: A random value to securely sign session values. Use a password generator to set this
   - `GOOGLE_MAPS_BROWSER_KEY` and `GOOGLE_MAPS_SERVER_KEY`: Refer to the Google Maps section of this document to generate these keys
   - `CONTACT_EMAIL`: The email shown on the site that the user could
   contact for more information. For development purposes, this can be any email address.

   You can optionally configure the email sender. If it is unconfigured, emails will silently fail to send:

   - `SENDINBLUE_EMAIL`: Login email for SendInBlue
   - `SENDINBLUE_PASSWORD`: Login password for SendInBlue

10. Install dependencies and migrate the database

   If you've incorrectly configured your database, the second command will fail with an error. Correct that error before continuing.

   ```bash
   yarn
   yarn run migrate:latest
   ```

11. Start the server to test that everything is working before configuring NGINX and automatic restarting:

   ```bash
   CAS_DISABLED='true' yarn run start
   ```

   If the server exits, read the messages and correct the error. You should be able to browse to _http://[your:ip:here]:8000_ and browse the site.

   By setting CAS_DISABLED, you won't have to configure CAS to test the site. If this is left out, then the two CAS configuration lines must be set up in the `.env` file.

12. Configuring NGINX

   This step is best done from an administrator account. If you switched away to test the project, switch back to an admin account now.

   ```bash
   sudo apt install -y nginx
   ```

   You can verify that NGINX is running by loading your website at the default port _http://[your:ip:here]_.

13. Configure HTTPs

   If you are using a different operating system or server other than NGINX, follow the instrucitons at [certbot.eff.org](https://certbot.eff.org/lets-encrypt/ubuntubionic-nginx).

   ```bash
   sudo apt install -y software-properties-common
   sudo add-apt-repository universe
   sudo add-apt-repository ppa:certbot/certbot
   sudo apt update

   sudo apt install -y certbot python3-certbot-nginx

   sudo certbot certonly --nginx

   # You'll be prompted for information about the website. Fill this information out accurately.
   ```

14. Finish NGINX Configuration

   Replace the default NGINX configuration (located at `/etc/nginx/sites-enabled/default`) with the contents of the template provided in the project, in the `nginx` directory.

   Replace all four instances of `carpool.cs.lafayette.edu` with the correct domain name for the website.

   ```bash
   sudo systemctl restart nginx
   ```

# Google Maps

A project must be created at [console.cloud.google.com](https://console.cloud.google.com). Generate 1 key capable of using the Javascript Autocomplete APIs, and 1 key for the server side requests to the distance matrix.

# HTTPS

HTTPS is managed by separate software and doesn't interact with the code in this repository. Our deployment uses NGINX.

1. Install [NGINX](http://nginx.org/en/download.html) appropriately for your system
2. Install and configure [Certbot](https://certbot.eff.org/lets-encrypt/ubuntubionic-nginx)
3. Run certbot for the domain name of choice (carpool.cs.lafayette.edu currently), with the `certonly` option
3. Use configuration in `nginx/`, modify if the domain name was changed
