# Implementing FA2 Basket Token

## Overview

The idea is based on existing [Basket Protocol](https://github.com/CoinAlpha/basket-protocol)
implementation on Ethereum and adopted for the FA2 and Tezos specifics.

What is a basket? FA2 [basket](https://en.wikipedia.org/wiki/Basket_(finance)) is
a weighted group of several other underlying FA2 tokens intended to be sold and
bought together.

* Any token owner can accumulate underlying FA2 tokens and exchange them for the
  basket tokens (mint basket tokens). The basket contract becomes an owner of the
  underlying FA2 tokens used in the exchange.
  
* Basket tokens can be exchanged as any regular FA2 tokens.

* The owner of the basket tokens can exchange them back to underlying tokens
  (burn basket token).

When talking about FA2 tokens we usually distinguish addresses of the token owners
and the address of the FA2 contract. The FA2 basket contract is the owner of the
underlying tokens exchanged for the basket tokens and the FA2 contract that manages
the basket token at the same time.

## Differences With The Protocol Basket

Basket Protocol defines `depositAndBundle` and `debundleAndWithdraw` entry points.
Those entry points transfer underlying ERC-20 tokens from and to token owner account,
and mint and burn basket tokens. This approach has two problems:

* The basket contract must be an operator (or have approved allowances) for the
  underlying tokens owner account to perform `depositAndBundle`.

* Executing multiple FA2 transfers within the same operation will run out of gas
  on Tezos.

The proposed design uses two-phase approach for exchanging between the basket and
underlying tokens.

To mint basket tokens, and owner uses regular FA2 transfers to deposit underlying
tokens to the FA2 basket contract. Basket contract becomes an owner of the underlying
tokens and keeps staged balances per each token owner who made transfers. The token
owner who has some staged balances can exchange them for the basket tokens (mint).

Any owner of the basket tokens can burn them. The burn operation debit owner's
staged balances for the underlying tokens.

The owner of the staged balances can withdraw underlying tokens from the FA2 basket
contract at any time.

If someone wants to get basket tokens, they transfer underlying tokens to the FA2
basket contract in phase one and mint basket tokens in phase two. If someone wants
to exchange basket tokens back, they burn their basket tokens in phase one and
withdraw underlying tokens in phase two.

## Design

* Regular [FA2](https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md)
  entry points to transfer and inspect basket token.

* A receiver hook entry point tracks transfers of underlying basket tokens. Token
  owners can use regular FA2 token transfer to pass underlying basket tokens to
  the basket FA2 contract. The FA2 basket contract rejects receiving any token
  types other than basket underlying tokens. The FA2 basket contract keeps track
  of all the balances of "staged" underlying tokens.

* `withdraw` entry point lets a token owner to withdraw any staged underlying tokens
  transferred to the FA2 basket contract. `withdraw` entry point initiate a transfer
  of the underlying tokens from the basket contract to a token owner who has the
  requested staged balance.

* `mint` entry point mints requested amount of basket tokens into a sender account.
  A sender must have sufficient staged balance of underlying tokens that is debited
  accordingly using underlying basket weights.

* `burn` entry point burns specified amount of basket tokens owned by a sender.
  Sender's staged balances are debited accordingly using underlying basket weights.

## API

Bsket definition:

```ocaml
type global_token_id = {
  fa2 : address;
  token_id : token_id;
}

type basket_entry = {
  token : global_token_id;
  weight : nat;
}

type basket_definition = basket_entry list;
```

Entry points:

```ocaml
type withdraw_param = {
  fa2 : address;
  tokens : token_id list;
}

type basket_entrypoints =
  | Basket_token of fa2_entry_points (* standard FA2 entry points *)
  | Tokens_received of transfer_descriptor_param_michelson (* receiver hook *)
  | Withdraw of withdraw_param
  | Mint of nat (* number of basket tokens to mint *)
  | Burn of nat (* number of basket tokens to burn *)
```

## Hybrid implementations

Basket Protocol is based on a single token ERC-20 standard.
The FA2 standard allows to host multiple token types within the same FA2 contract.
FA2 basket implementation may use various approaches that can help optimize gas
usage:

* Basket token is implemented as a separate contract. Underlying basket tokens
  can be managed by several FA2 contracts (This is the most generic case).

* Basket token is implemented as a separate contract. Underlying basket tokens are
  managed by a single contract.

* Basket and all underlying tokens are managed by a single hybrid FA2 contract.
