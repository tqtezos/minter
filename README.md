![OpenMinter header](/docs/assets/minterhead.png)

[![](https://img.shields.io/badge/license-MIT-brightgreen)](LICENSE) [![](https://img.shields.io/badge/Docker-20.10.x-blue)](https://www.docker.com/) [![](https://img.shields.io/badge/version-v0.3.0-orange)](https://github.com/tqtezos/minter)

## OpenMinter

OpenMinter is dApp framework for enabling the creation and collection
of non-fungible tokens (NFTs) on Tezos. The dApp enables anyone to
create an NFT by filling in just a few fields, create new collection
contracts, see their NFTs across contracts, and enable marketplace
capabilities to trade them.

### Notice

This software is in beta. At the moment, the smart contracts
that OpenMinter uses have **not** been formally audited. Please
use this software at your own risk.

### Quickstart

To start a local OpenMinter instance, make sure you have [yarn][yarn] installed
(`v1.22.*` or above), and run:

```
yarn install
yarn start
```

Or with NPM:

```
npm install
npm started
```

## Support

OpenMinter supports the following networks and software components:

#### 🌐 Mainnet and Edonet
#### 📦 Sandboxed development via [Flextesa][flextesa]
#### 🎨 Multimedia NFTs powered by [TZIP-21](https://tzip.tezosagora.org/proposal/tzip-21/)
#### 👛 Various wallets via [Beacon](https://www.walletbeacon.io/)
#### 📖 Indexing via [Better Call Dev][bcdhub]
#### ⚙️ The latest [FA2](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md) specification
#### 🚀 [IPFS](https://ipfs.io/) via a local node or [Pinata](https://pinata.cloud/)

The following dependencies are required to run OpenMinter.

| Dependency | Version | Environments
|-|-|
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
  admin: {
    address: string,
    secret: string
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

The installation process will fetch toplevel NPM dependences and build
the `minter-ui-dev` and `minter-api-dev` Docker images.

### Running

To start and stop OpenMinter, run:

```sh
yarn start
# or
yarn stop
```

## Sandboxed Development

TODO: Write up local development documentation
