# OpenMinter

## Description

OpenMinter is an open-source tool to allow anyone
to create, manage, and use assets on the Tezos blockchain
via the FA2 standard. The tool enables the user to easily
create any type of asset (fungible, semi-fungible,
non-fungible), deploy their own associated contracts for
those assets, manage them with an administration interface,
and eventually use them via third-party services (exchanges,
auctions, voting - DAOs, and games).

## Requirements

Name    | Version   | Download
--------|-----------|----------
Docker  | `19.03.x` | [Link][docker]

[docker]: https://www.docker.com/

> Note: on Ubuntu add your user to `docker` group so that
> scripts using docker can be executed without sudo:
>
>  `sudo usermod -a -G docker <username>`

## Dependencies

- Tezos sandbox: [Flextesa][flextesa]
- Blockhain indexer: [TZ Index][tz-index]
- Database: [PostgreSQL][postgres]
- InterPlanetary File System [IPFS][ipfs]

[tz-index]: https://github.com/blockwatch-cc/tzindex
[flextesa]: https://gitlab.com/tezos/flextesa
[postgres]: https://www.postgresql.org/
[ipfs]: https://ipfs.io/

## Usage

### Setup

First build docker images for development:

```
bin/build-dev-images
```

Next, import a Tezos private key. For local development, we can use the default
`Alice` secret key that's included in the Tezos sandbox node:

```
printf "edsk3QoqBuvdamxouPhin7swCvkQNgq4jP5KZPbwWNnwdZpSpJiEbq" | docker secret create tz_private_key -
```

### Starting and Stopping

We can now start our docker swarm services:

```
bin/start
```

To stop and teardown the services, run:

```
bin/stop
```


### Originating Contracts

Once you've started the docker swarm services with `bin/start`, the Minter needs
a set of initial contracts to interact with. To originate them run:

```
bin/originate-fa2-nft-contracts
```

You can now open:

- [http://localhost:9000](http://localhost:9000) to view the application.
- [http://localhost:9000/graphql](http://localhost:9000/graphql) to open the GraphQL playground.

### Using Local IPFS Server

Once your've started the docker swarm services with `bin/start` a local instance of IPFS server will be automatically
configured and started. No actions needed to use it for file upload. 

However, if you wish to monitor the IPFS server or reconfigure it using its Web UI, you can use:
[[http://localhost:5001/webui](http://localhost:5001/webui)

## Development

Note the names of the services printed by the start script and check their log
output, e.g.:

```
docker service logs minter-dev-sandbox_api-server --follow
```

Docker development images are set up to reload server and web ui on source code
changes.

To setup this project for an IDE, you will want to install NPM dependencies
outside of Docker. Make sure you have [Yarn](https://yarnpkg.com)
(version `1.22.x` or above) installed:

```sh
pushd client; yarn; popd
pushd server; yarn; popd
```

By default `bin/start` starts sandbox environment. To run against public tezos
nodes with public instance of tzstats start with

```sh
bin/start dev-testnet
```

To explore the database with with `psql`:

```sh
bin/psql
```

or, if using `dev-testnet` environment:

```sh
bin/psql dev-testnet
```

To modify database add migration SQL file(s) to `db/` and perform migrations:

```sh
bin/migrate-db
```

or simply stop and start.

Individual services in docker stack can be restarted like so:

```
docker service scale minter-dev-sandbox_api-server=0
docker service scale minter-dev-sandbox_api-server=1
```

Or with a helper shell function

```
svc-restart api-server
```

where `svc-restart` is defined as

```
svc-restart(){docker service scale minter-dev-sandbox_$1=0 && docker service scale minter-dev-sandbox_$1=1}
```

## Release Builds (WIP)

Development ui and api server builds can be swapped out for release builds:

```
bin/build-release-images
```

and then

```
STACK_API_SERVER_DEF=api-server STACK_UI_DEF=ui bin/start
```
