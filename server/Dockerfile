FROM node:18-alpine

WORKDIR /server

# copy project code
COPY . /server

# copy package.json and install dependencies
RUN npm install

# expose the port
EXPOSE ${NODE_DOCKER_PORT}

# start the application
CMD npm start