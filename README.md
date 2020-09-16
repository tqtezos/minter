# OpenMinter

## Description

OpenMinter is in-development open-source tool to allow anyone
to create, manage, and use assets on the Tezos blockchain
via the FA2 standard. The tool enables the user to easily
create any type of asset (fungible, semi-fungible,
non-fungible), deploy their own associated contracts for
those assets, manage them with an administration interface,
and eventually use them via third-party services (exchanges,
auctions, voting - DAOs, and games).

## Requirements

| Name   | Version   | Download       |
| ------ | --------- | -------------- |
| Docker | `19.03.x` | [Link][docker] |

[docker]: https://www.docker.com/

> Note: on Ubuntu add your user to `docker` group so that
> scripts using docker can be executed without sudo:
>
> `sudo usermod -a -G docker <username>`

## Dependencies

- Tezos sandbox: [Flextesa][flextesa]
- Blockhain indexer: [TZ Index][tz-index]
- Database: [PostgreSQL][postgres]
- InterPlanetary File System: [IPFS][ipfs]

[tz-index]: https://github.com/blockwatch-cc/tzindex
[flextesa]: https://gitlab.com/tezos/flextesa
[postgres]: https://www.postgresql.org/
[ipfs]: https://ipfs.io/

## Usage

### Setup

First install all the packages and build docker images for the development:

```sh 
$ yarn
```
or
```sh 
$ yarn install
```

Next, import a Tezos private key. For local development, we can use the default
`Alice` secret key that's included in the Tezos sandbox node:

```sh
$ printf "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq" | docker secret create tz_private_key -
```

This step is not required for the development environment since the secret key is
stored and picked up from the config file.

### Starting and Stopping

We can start development environment either using sandbox or connecting to Tezos
test net.

To start our docker swarm services using sandbox run:

```sh
$ yarn start
```

or

```sh
$ yarn start:sandbox
```

To stop and teardown the services, using sandbox run:

```sh
$ yarn stop
```

or

```sh
$ yarn stop:sandbox

```

To start our docker swarm services using testnet run:

```sh
$ yarn start:testnet
```

To stop and teardown the services, using testnet run:

```sh
$ yarn stop:testnet
```

### Originating Contracts

Once you've started the docker swarm services with `yarn start-xxx`, it will
automatically bootstrap a set of initial contracts to interact with.

You can now open:

- [http://localhost:9000](http://localhost:9000) to view the application.
- [http://localhost:9000/graphql](http://localhost:9000/graphql) to open the
  GraphQL playground.

### Using Local IPFS Server

Once your have started the docker swarm services with `yarn start-xxx`, a local
instance of IPFS server will be automatically configured and started.
No actions needed to use it for file upload.

However, if you wish to monitor the IPFS server or reconfigure it using its Web
UI, you can use:
[http://localhost:5001/webui](http://localhost:5001/webui)

## Development

To see a list of services running after you've started the system, run:

```sh
$ docker service ls
```

### Accessing Service Logs

To view each service's logs, the `bin/log` command is available. It can be run
using yarn scripts `yarn log` or directly. It's a small wrapper around
`docker service logs` that matches the first service you provide
it:

```sh
$ yarn log:api
```

or

```sh
$ bin/log api
```

...which is a shorter way of doing the following:

```sh
$ docker service logs minter-dev-sandbox_api-server --follow --raw
```

To view the UI output, for example, run:

```sh
$ yarn log:ui
```

or

```sh
$ bin/log ui
```

You may also override the script's default [docker service logs arguments](https://docs-stage.docker.com/engine/reference/commandline/service_logs/)
(`--follow` and `--raw`) by passing them at the end of the command. For example:

```sh
$ bin/log api --since 5m
```

### Editor Environments

Docker development images are set up to reload server and web ui on source code
changes.

To setup this project for an IDE, you will want to install NPM dependencies
outside of Docker. Make sure you have [Yarn](https://yarnpkg.com)
(version `1.22.x` or above) installed:

```sh
$ pushd client; yarn; popd
$ pushd server; yarn; popd
```

### Running on Testnet

By default `bin/start` starts sandbox environment. To run against public tezos
nodes with public instance of tzstats start with

```sh
$ bin/start dev-testnet
```

### Exploring the Database

To explore the database with with `psql`:

```sh
$ bin/psql
```

or, if using `dev-testnet` environment:

```sh
$ bin/psql dev-testnet
```

To modify database add migration SQL file(s) to `db/` and perform migrations:

```sh
$ bin/migrate-db
```

or simply stop and start.

### Restarting Services

Individual services in docker stack can be restarted like so:

```sh
$ docker service scale minter-dev-sandbox_api-server=0
$ docker service scale minter-dev-sandbox_api-server=1
```

Or with a helper shell function

```sh
$ svc-restart api-server
```

where `svc-restart` is defined as

```sh
$ svc-restart(){docker service scale minter-dev-sandbox_$1=0 && docker service scale minter-dev-sandbox_$1=1}
```

## Release Builds (WIP)

Development ui and api server builds can be swapped out for release builds:

```sh
$ bin/build-release-images
```

and then

```sh
STACK_API_SERVER_DEF=api-server STACK_UI_DEF=ui bin/start
```
