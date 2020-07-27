# Minter

## Description

WIP

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

[tz-index]: https://github.com/blockwatch-cc/tzindex
[flextesa]: https://gitlab.com/tezos/flextesa
[postgres]: https://www.postgresql.org/

## Usage

Build docker images for development:

```
bin/build-dev-images
```

Start services in docker swarm:

```
bin/start
```

To stop:

```
bin/stop
```
You can now open:

- [http://localhost:9000](http://localhost:9000) to view the application.
- [http://localhost:9000/graphql](http://localhost:9000/graphql) to open the GraphQL playground.

## Development

Note names of the services printed by the start script and check their log
output, e.g.:

```
docker service logs minter-dev-sandbox_api-server --follow
```

Docker development images are set up to reload server and web ui on source code
changes.

To setup this project for an IDE, you will want to install NPM dependencies
outside of Docker:

```sh
pushd client; yarn install; popd
pushd server; yarn install; popd
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
