# OpenMinter

## Description

OpenMinter is an in-development open-source tool to allow anyone
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

> Note: on Ubuntu add your user to the `docker` group so that scripts using
> docker can be executed without `sudo`:
>
> `sudo usermod -a -G docker <username>`

## Dependencies

- Tezos sandbox: [Flextesa][flextesa]
- Blockhain indexer: [Better Call Dev Backend][bcdhub]
- Database: [PostgreSQL][postgres]
- InterPlanetary File System: [IPFS][ipfs]

[bcdhub]: https://github.com/baking-bad/bcdhub
[flextesa]: https://gitlab.com/tezos/flextesa
[postgres]: https://www.postgresql.org/
[ipfs]: https://ipfs.io/

## Usage

### Installation

To install and build the dependences required for local development, run:

```sh
$ yarn install
```

The installation process will fetch toplevel NPM dependences and build
the `minter-ui-dev` and `minter-api-dev` Docker images. Subsequent runs of
`yarn install` will rebuild these images without checking for cached versions.

### Configuration

The Minter can be configured to run on three different networks: `sandbox`,
`testnet` (currently set to delphinet), and `mainnet`.

Each network has its own configuration file in the `config` folder under
`minter.<network>.json`. The schema of these files can be defined as this
TypeScript type:

```typescript
type Config = {
  rpc: string,
  admin: {
    address: string,
    secret: string
  },
  contracts?: {
    nftFaucet?: string,
    nftFactory?: string
  }
}
```

For example, the following `minter.sandbox.json` configuration defines the RPC
url for the local sandbox node and the default `alice` address as the
administrator during contract origination:

```json
{
	"rpc": "http://localhost:8732",
	"admin": {
		"address": "tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU",
		"secret": "edsk3RFgDiCt7tWB2oe96w1eRw72iYiiqZPLu9nnEY23MYRp2d8Kkx"
	}
}
```

> **Note:** Since sandbox and testnet keys don't represent sensitive accounts, the `config/`
> folder includes default configurations with `admin` wallets. To configure Minter
> for the `mainnet` network, update the definitions in
> `config/minter.mainnet.example.json` and copy it to the proper path for the
> application to read it:
>
> `cp config/minter.mainnet.example.json config/minter.mainnet.json`

If the `contracts` key or its children `nftFaucet` or `nftFactory` keys are not
specified, these contracts will be originated and their addresses saved in the
configuration file when starting the Minter devleopment environment.

### Starting and Stopping

During its start process, Minter will create or update Docker services for its
specified environment and also bootstrap the required contracts if their
addresses are not defined in the environment's configuration file.

#### Sandbox

To start Minter on a `sandbox` network, run:

```sh
$ yarn start:sandbox
```

This command will start the following services:
- `flextesa` sandbox container
- Better Call Dev indexer API, GUI, and its required backend services
- Minter UI
- Minter API
- IPFS Node

To stop and teardown these services, run:

```sh
$ yarn stop:sandbox
```

#### Testnet

To start Minter on a `testnet` network, run:

```sh
$ yarn start:testnet
```

This command will start the following services:
- Minter UI
- Minter API
- IPFS Node

To stop and teardown these services, run:

```sh
$ yarn stop:testnet
```

#### Mainnet

To start Minter on a `mainnet` network, run:

```sh
$ yarn start:mainnet
```

This command will start the following services:
- Minter UI
- Minter API
- IPFS Node

To stop and teardown these services, run:

```sh
$ yarn stop:mainnet
```

### Interacting with Minter

After starting Minter, you can now open:

- [http://localhost:9000](http://localhost:9000) to view the Minter application.
- [http://localhost:9000/graphql](http://localhost:9000/graphql) to open the
  GraphQL playground.
- [http://localhost:5001/webui](http://localhost:5001/webui) to open the IPFS
  Web UI


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

...which is a shorter way of doing the following:

```sh
$ docker service logs minter-dev-sandbox_api-server --follow --raw
```

To view the UI output, for example, run:

```sh
$ yarn log:ui
```

You may also override the script's default [docker service logs arguments](https://docs-stage.docker.com/engine/reference/commandline/service_logs/)
(`--follow` and `--raw`) by passing them at the end of the command. For example:

```sh
$ yarn log:api --since 5m
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
