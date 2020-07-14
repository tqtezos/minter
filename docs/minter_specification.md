# Minter Specification

## Type of Tokens

### Fungible

#### Create New Fungible Token

* Specify token metadata.
* Specify initial balances

Questions:

* What is operator?

#### Manage Fungible

* Mint additional tokens to some owner account

Questions:

* Should we support fixed supply fungible token?

### Non Fungible

#### Create a Single NFT Token

* Specify metadata and token image.
* Image is stored on IPFS. Token metadata should contain image URL and IPFS hash.
* Specify initial token owner

Questions:

* Why metadata has decimals? It should be always 0 for NFTs
* Should we support NFT collections as [rarible](https://app.rarible.com/create/erc1155)?

### Semi-Fungible

Not defined, besides that they have limited supply. What is the difference from
the fungible tokens?

### Basket

The screen implies that the user can mint basket tokens. Instead the user must
define a basket ([see](https://github.com/tqtezos/minter/blob/master/docs/implementint_FA2_basket_token.md))
as weighted

### Badges

Louiz mentioned that we need to support badges. Badges are like semi-fungible
tokens that cannot be transferred by the token owner.

### General Questions

* Transaction Form: What are "Pay with" options? Gas money to pay for transaction?
  If yes, how is USD option to be supported?
* There is no token transfer form
