# Batch Minting 

Batch minting is now available in OpenMinter via 
the usage of a csv template. Users can mint a large
amount of tokens in a single transaction to a 
collection of their choice by following the provided 
template and filling it in with their own information.

## The Template 

Note - the template can be found [here](batch_template.csv) and for testnet [here](batch_template_testnet.csv)

The template requires the following fields to be filled in:
- **name**: The name of the token you wish to mint.
- **description**: The description of the token.
- **collection**: The contract address of the collection you
would like the token to be in. This must be an existing contract.
- **artifactUri**: The IPFS hash of the NFT's core artifact. 
The user is required to use an existing service such as Pinata
to upload their images to be pinned there in order to obtain
an IPFS hash. 
- **displayURI**: What is to be displayed in interfaces for the
NFT (note: this is typically the same as the `artifactUri`).
- **attribute.key**: Additional columns made in the csv will 
correspond to additional keys associated with the NFT. The
format consists of the column header being the key 
`attribute.(your key)` and the cell in the NFT's row being
its corresponding value. 

Once completed, a user can upload their csv to the first step
of the new asset screen to batch-create their assets.

NOTE: If any fields in the template are filled in incorrectly,
the transaction will fail.