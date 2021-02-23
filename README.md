![OpenMinter header](/docs/assets/minterhead.png)

[![](https://img.shields.io/badge/license-MIT-brightgreen)](LICENSE) [![](https://img.shields.io/badge/Docker-19.03.x-blue)](https://www.docker.com/) [![](https://img.shields.io/badge/version-v0.1-orange)](https://github.com/tqtezos/minter)

## Notice

This software is in beta. At the moment, the smart contracts 
that OpenMinter uses have **not** been formally audited. Please
use this software at your own risk. 

## OpenMinter

OpenMinter is dApp framework for enabling the creation and collection
of non-fungible tokens (NFTs) on Tezos. The dApp enables anyone to
create an NFT by filling in just a few fields, create new collection
contracts, see their NFTs across contracts, and enable marketplace
capabilities to trade them.

Current version supports the following:
#### 🌐 Mainnet and Delphinet (Edonet soon)
#### 🎨 Image-based NFTs
#### 👛 [Beacon](https://www.walletbeacon.io/) support
#### ⚙️ The latest [FA2](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md) spec
#### 🚀 [IPFS](https://ipfs.io/) support (locally and [Pinata](https://pinata.cloud/))

## Dependencies

- Tezos sandbox: [Flextesa][flextesa]
- Blockhain indexer: [Better Call Dev Backend][bcdhub]
- Database: [PostgreSQL][postgres]
- InterPlanetary File System: [IPFS][ipfs]
- [Docker][docker]
- [Yarn][yarn]

[bcdhub]: https://github.com/baking-bad/bcdhub
[flextesa]: https://gitlab.com/tezos/flextesa
[postgres]: https://www.postgresql.org/
[ipfs]: https://ipfs.io/
[docker]: https://www.docker.com/get-started
[yarn]: https://classic.yarnpkg.com/en/docs/install

## Usage

### Installation

To install and build the dependences required for local development, run:

```sh
$ yarn install
```

The installation process will fetch toplevel NPM dependences and build
the `minter-ui-dev` and `minter-api-dev` Docker images.

### Configuration

The Minter can be configured to run on three different networks: `sandbox`,
`testnet` (currently set to delphinet), and `mainnet`.

Each network has its own configuration file in the `config` folder under
`minter.<network>.json`. The schema of these files can be defined as this
TypeScript type:

```typescript
type Config = {
  rpc: string,
  network: string,
  bcd: {
    api: string,
    gui: string
  },
  admin: {
    address: string,
    secret: string
  },
  pinata?: {
    apiKey: string,
    secretKey: string
  },
  contracts?: {
    nftFaucet?: string
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

> **Note:** Since sandbox keys don't represent sensitive accounts, the `config/`
> folder includes default configurations with `admin` wallets. To configure
> OpenMinter for the `testnet` or `mainnet` networks, update the definitions in
> `config/minter.<network>.example.json` and copy it to the proper path for the
> application to read it. For example:
>
> `cp config/minter.mainnet.example.json config/minter.mainnet.json`

If the `contracts` key or its child `nftFaucet` keys is not specified, a new
contract will be originated and its addresses saved in the configuration file
when starting the OpenMinter development environment.

#### Pinata

Testnet and Mainnet instances of OpenMinter can include [Pinata][pinata] API
keys in order to direct all file uploads through their service. This allows for
ease of use while working with IPFS as running OpenMinter without Pinata will
rely on using and maintaining a local IPFS node.

> ⚠️ **Note:** The example `testnet` and `mainnet` configurations in the
`config/` folder have placeholder Pinata API keys as it's the most robust way
> to easily persist data on IPFS. Using OpenMinter on these networks without
> Pinata may cause data loss as the NFT metadata and artifacts must be resolved
> over IPFS. If you want to use OpenMinter on these networks without Pinata,
> remove the `pinata` key from the configuration, but be aware that this entails
> running and maintaining your own IPFS gateway in order for your NFT data token
> remain accessible.


[pinata]: https://pinata.cloud

### Starting and Stopping

During its start process, OpenMinter will create or update Docker services for
its specified environment and also bootstrap the required contracts if their
addresses are not defined in the environment's configuration file.

#### Sandbox

To start Minter in a `sandbox` network, run:

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

To start Minter on the `testnet` network, run:

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

To start Minter on the `mainnet` network, run:

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

Docker development images are set up to reload server and web UI on source code
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

Development UI and API server builds can be swapped out for release builds:

```sh
$ bin/build-release-images
```

and then

```sh
STACK_API_SERVER_DEF=api-server STACK_UI_DEF=ui bin/start
```
