# Minter First Iteration

This document is a road map for the implementation of the minimal viable minter
workflow. Main goals of the first iteration is to shape the architecture of the
whole application, select tools and technologies and define initial application
framework.

The first iteration will implement minimal `Create NFT` use-case:

1. the user enters all token metadata, their own tz1 address and initiates the mint
   operation.

2. Server saves the token image to IPFS and uses IPFS URL and image hash to populate
   token metadata.

3. Server submits the mint operation to the NFT contract using the admin key to
   sign it.

4. Server shows to the user progress of the operation and its final status (success
   or failure).

## What is Included And What is Not

1. There is no wallet integration. The user should manually type or paste their
   tz1 address.

2. There is no IPFS integration. IPFS stub either saves images to the disk or memory
   or just provides static image.

3. Tezos node (sandbox, testnet) is included for the interaction with contracts.

4. There is no indexer integration. The first iteration supports token creation
   (minting), but not the `Assets` view.

5. The application must persist active operation (session) state. Kafka or relational
   database may be used to keep and update session state.

## Implementation details

When the user initiates `create NFT` operation, it goes through the following stages
that need to be kept persistent:

1. `Submitted`. Holds all user submitted data to create a new NFT token.
2. `Saving image to IPFS`. After completion, add image URL and image hash to the
   state data.
3. `Minting`. Call NFT contract `mint` entry point. Add pending operation hash
   to the state data.
4. `Mint success`. Got confirmation for the mint operation.
5. `Mint failure`. Add error message to the state data.

The user subscribes and receives updates on the progression of the `create NFT`
operation. In case of failure, the user may resubmit the same operation again.

All calls to the NFT contract `mint` entry point are executed on behalf of the
minter admin (signed by the minter admin private key). Because of the nature of
Tezos, there can be only one pending mint operation at any moment in time. Thus,
backend server should maintain a queue of submitted operations. It should execute
the following loop:

1. Wait until pending mint operation is completed (either failed or confirmed).
2. Dequeue a next batch from the submitted queue and initiate next mint operation.

The admin address pays for the `create NFT` transaction.

## Next Iteration

There are following features that can be implemented next to enhance minimal
implementation.

### Assets View

Integrate indexer and implement `Assets` view. Use indexer to discover all the
tokens owned by the user.

### IPFS Integration

Replace IPFS stub with real implementation (must run IPFS node in docker).
`Create NFT Token` and `Assets` view should save and display token images.

### Wallet Integration

When wallet login is integrated, the following functionality can be implemented:

- Auto-fill token owner tz1 address from the wallet instead of user typing it every
  time.

- Implement `Transfer` form. Transfer operations can (and should) be signed by the
  user private key.

### Reference Database

Each user can create aliases for some other Tezos addresses. The user can specify
an alias instead of the address for any operation that needs addresses (like `transfer`).
Readonly data (like `Assets` view from) can display aliases next to the real address,
if the one exists.

### Paying For `Create Token` transaction

Research and implement one or more schemes to pay for the `create token` transaction.
Possible approaches:

- User send some Tezos tokens to the admin account to prepay for the transaction.
- Use gas station.
- Others.
