![OpenMinter header](/docs/assets/minterhead.png)

[![](https://img.shields.io/badge/license-MIT-brightgreen)](LICENSE) [![](https://img.shields.io/github/v/release/tqtezos/minter)](https://github.com/tqtezos/minter)

## OpenMinter

OpenMinter is dApp framework for enabling the creation and collection
of non-fungible tokens (NFTs) on Tezos. The dApp enables anyone to
create an NFT by filling in just a few fields, create new collection
contracts, see their NFTs across contracts, and enable marketplace
capabilities to trade them.

### Notice

This software is in beta. At the moment, the [smart contracts](https://github.com/tqtezos/minter-sdk)
that OpenMinter uses have **not** been formally audited. Please
use this software at your own risk.

### Quickstart

To start an OpenMinter instance on `testnet`, make sure you have [yarn][yarn]
installed (`v1.22.*` or above), and run:

```
yarn install
yarn start
```

## Support

OpenMinter supports the following networks and software components:

#### 🌐 Mainnet and Florencenet
#### 📦 Sandboxed development via [Flextesa][flextesa]
#### 🎨 Multimedia NFTs powered by [TZIP-21](https://tzip.tezosagora.org/proposal/tzip-21/)
#### ⚙️ Smart contracts based on [minter-sdk](https://github.com/tqtezos/minter-sdk)
#### 👛 Wallets compatible with [Beacon](https://www.walletbeacon.io/)
#### 📖 Indexing via [tzkt](https://api.tzkt.io/)
#### 🚀 [IPFS](https://ipfs.io/) via a local node or [Pinata](https://pinata.cloud/)
#### 🏭 Batch minting support

The following dependencies are required to run OpenMinter.

| Dependency | Version | Environments
|-|-|-|
| [Yarn][yarn] | `v1.22.*` or above | All
| [Docker][docker] | `v20.10.*` or above | Sandbox

[bcdhub]: https://github.com/baking-bad/bcdhub
[flextesa]: https://gitlab.com/tezos/flextesa
[postgres]: https://www.postgresql.org/
[ipfs]: https://ipfs.io/
[docker]: https://www.docker.com/get-started
[yarn]: https://classic.yarnpkg.com/en/docs/install

## Usage

### Configuration

The Minter can be configured to run on three different networks: `sandbox`,
`testnet` (currently set to edonet), and `mainnet`.

Each network has its own configuration file in the `config` folder under
`<network>.json`. The schema of these files can be defined as this TypeScript type:

```typescript
type Config = {
  rpc: string,
  network: string,
  bcd: {
    api: string,
    gui: string
  },
  contracts?: {
    nftFaucet?: string
    marketplace?: {
      fixedPrice: {
        tez: string;
      }
    }
  }
}
```

### Installation

To install and build the dependences required for local development, run:

```sh
$ yarn install
```

The installation process will fetch toplevel NPM dependences

### Running

To start OpenMinter on `testnet`, run:

```sh
yarn start # or yarn start:testnet
```

To run OpenMinter configured for `mainnet`, run:

```sh
yarn start:mainnet
```

### Bootstrapping Your Own Contracts

OpenMinter ships with a set of contracts on mainnet and testnet that are intended
only as a reference implementation and demo. In most cases, you will want to
originate your own contracts to run OpenMinter. OpenMinter includes a configuration
wizard CLI tool to make this process quick and easy.

To start the configuration wizard, run:

```sh
yarn bootstrap
```

Once the configuration wizard is complete, you can run OpenMinter with your
custom config by running:

```sh
yarn start:custom
```

And to build OpenMinter for a production deployment with your custom config, run:

```sh
yarn build:custom
```

## Sandboxed Mode

Sandboxed mode is available for OpenMinter for local testing purposes. Make sure
[Docker][docker] is installed on your system to run the local services.

> **NOTE**: All data in sandboxed mode is ephemeral. Restarts will _not_ persist
> any blockchain or indexer data.

### Setup and Starting

To start local sandbox services and create the required default contracts, run:

```sh
yarn bootstrap:sandbox
```

Finally, to run the OpenMinter UI, run:

```sh
yarn start:sandbox
```

### Stopping

Pressing `Ctrl-C` (or `Command-C` on MacOS) after starting the OpenMinter UI
will quit the React Scripts process. To teardown the Docker compose system, run:

```sh
yarn teardown:sandbox
```
