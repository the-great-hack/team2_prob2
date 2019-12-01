# Multimode Transport

A sample ride hailing project built using [Node.js](https://nodejs.org) and [Docker](https://docker.com) for managing multi-mode transport between two points

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

Before running the project on your system, make sure you have the following software installed.

- [yarn](https://yarnpkg.com) - fast and reliable dependency management
- [docker](https://docker.com) - OS level virtualization to deliver packages called containers (optional)

### Installing

To initialize the project, first navigate to the root directory and build the project

```
yarn
yarn build
```

The services can be run in development mode

```
yarn start:dev
```

And in production mode (without Docker) using

```
yarn start:prod
```

## Deployment

To get the project up and running in a production ready environment run the following command in the root directory

```
docker build -t the-great-hack-careem .
docker run -p 3000:3000 the-great-hack-careem
```

If everything goes well, the project can be viewed at [http://localhost:3000](http://localhost:3000)

## Technologies

- [Babel](https://babeljs.io) - Compile JavaScript to a primitive version
- [Docker](https://docker.com) - OS level virtualization
- [Express](https://expressjs.com) - Web application framework for Node.js
- [Vue.js](https://vuejs.org) - JavaScript framework for building user interfaces

## Support

The project is conceived overnight as of December 1, 2019, and is prone to bugs or several technical issues. Please contact the repo owner in case of any unmitigated circumstances.

## Authors

- **Wahaj Aayani** - _Initial work_ - [aayani](https://github.com/aayani)
- **Affan Akhter** - _Initial work_ - [affan007](https://github.com/affan007)
- **Osama Abid** - _Initial work_ - [dexter1122](https://github.com/dexter1122)
