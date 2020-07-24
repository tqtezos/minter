# smart-contract-ui

User interface for originating, managing and monitoring standard smart contracts

## Description

This application uses TypeScript and React to render components that interact
with Tezos via a GraphQL backend using the [Taquito][taquito] library. The CSS
portion uses [ant][ant].

This project was bootstrapped with [Create React App][cra], and its
configuration has been ejected to compensate for the project's structure.

[taquito]: https://tezostaquito.io/
[ant]: https://ant.design/
[cra]: https://github.com/facebook/create-react-app

[See the research directory](research/) to explore initial language and
library examples.

## Requirements

Name    | Version   | Download
--------|-----------|----------
Docker  | `19.03.x` | [Link][docker]

[docker]: https://www.docker.com/

> Note: on Ubuntu add your user to `docker` group so that
> scripts using docker can be executed without sudo:
>
>  ```
>  sudo usermod -a -G docker itkach
>  ```

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

Note names of the services printed by the start script and check their log
output, e.g.:

```
docker service logs tq-ui-dev-sandbox_api-server --follow
```

Create users:

```
bin/create-sandbox-users
```

This will create two users, `alice` and `bob` with tezos addresses from the
sandbox:

Name        | Username | Password
------------|----------|---------
Alice Smith | alice    | `password`
Bob White   | bob      | `password`


You can now open:

- [http://localhost:9000](http://localhost:9000) to view the application.
- [http://localhost:9000/graphql](http://localhost:9001/graphql) to open the GraphQL playground.


Docker development images are set up to reload server and web ui on source code
changes.

For IDE setup you probably want to install dependencies:

```
npm install
```

By default `bin/start` starts sandbox environment. To run against public tezos
nodes with public instance of tzstats start with

```
bin/start dev-testnet
```

To explore the database with with `psql`:

```
bin/psql
```

or, if using `dev-testnet` environment:

```
bin/psql dev-testnet
```

To modify database add migration SQL file(s) to `db/` and perform migrations:

```
bin/with-env dev-testnet bin/migrate-db
```

or simply stop and start.

Individual services in docker stack can be restarted like so:

```
docker service scale tq-ui-dev-sandbox_api-server=0
docker service scale tq-ui-dev-sandbox_api-server=1
```

Or with a helper shell function

```
svc-restart api-server
```

where `svc-restart` is defined as

```
svc-restart(){docker service scale tq-ui-dev-sandbox_$1=0 && docker service scale tq-ui-dev-sandbox_$1=1}
```

Development ui and api server builds can be swapped out for release builds:

```
bin/build-release-images
```

and then

```
STACK_API_SERVER_DEF=api-server STACK_UI_DEF=ui bin/start
```
