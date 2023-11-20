# relic-query-server

*App for approved users to share and view 3D models on the web (Portfolio Demonstration) - Server API*

By [David J. Thomas](mailto:dave.a.base@gmail.com), [thePort.us](https://thePort.us)

---

Full Stack (MySQL ExpressJS Angular NodeJS) app for to share 3D models on the web. Upload is limited
to only those users pre-approved by the site owner.

---

## Installation

Current installation is on a Docker setup.


Install docker, and docker-compose locally. Then clone this repo and move inside the directory. Finally, fetch the submodule, which contains the seeder data.

``` sh
git clone https://github.com/thePortus/relic-query-server.git
cd relic-query-server
git submodule update --init --recursive
```

Thenm, modify the following files with your desired accounts/passwords/ports

``` sh
# most crucial, for setting account passwords
sudo nano /docker-compose.yml
# you must change the server_name and redirect to have the url to which you are deploying
sudo nano /nginx/nginx.conf
```

Now, launch the docker containers with `docker compose up -d`.

The run command in our `docker-compose.yml` should have gotten the SSL certifictes for us already.

After docker is up... use `docker exec` to shell into the server container...

``` sh
# run to get list of docker container names, look for server
docker ps
# shell into the server container
docker exec -it SERVER_CONTAINER_NAME sh
# run the server seeders
source migrate
# exit out of container shell
exit
```

Now, set the certbot to autorenew.

``` sh
docker compose run --rm certbot renew
```

Then, stop the webserver, and output the dhparam key

``` sh
docker compose stop webserver
sudo openssl dhparam -out /home/YOUR_USERNAME/icam-server/dhparam/dhparam-2048.pem 2048
```

Finally, modify the `nginx/nginx.conf` file and uncomment the lower server block. MAKE SURE to replace values with your domains. Then restart the server with `docker compose restart`.

If you have problems and the docker container keeps restarting, the certbot might not have run correctly. To fix this, first, bring down the container with `docker compose down`. Then, re-comment out the SSH lines in your `nginx/nginx.conf` file. Now, bring the image back up with `docker compose up -d`. Then run the command `docker compose run --rm certbot certonly --webroot --webroot-path /var/www/html/ --email sample@your_domain --agree-tos --no-eff-email -d your_domain -d www.your_domain`. Once it is complete, un-comment out the `nginx/nginx.conf` file and `docker compose up -d` to get it started.

That's it, the server should be up an running.
