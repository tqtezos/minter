### Purpose
The general purpose of the FA2 minter will be to create 
an open-source tool to allow anyone to create, manage, and 
use assets on the Tezos blockchain. The goal is to allow 
users to have an abstracted interface to easily create 
any type of asset (fungible, semi-fungible, non-fungible), 
deploy their own associated contracts for those assets, 
manage them with an accessible functions interface (mint 
additional assets, transfer assets, analytics, etc.), and 
use them via third-party services (exchanges, auctions, 
voting - DAOs, and games). 

### First Release Goals

The initial goal for a first release will be to create an 
interface to enable users to mint, view, and transfer their 
NFTs. This first iteration will use a single contract to 
create the assets in order to avoid any metadata issues 
before its standardized. Users will connect their wallets 
in order to pay the fee for transactions. After the transaction 
is paid for, users will have the ability to view the assets 
associated with their accounts, view details about them, 
and have the ability to transfer them. 

#### On Future Releases 

Future iterations will include extended functionality 
on all three factors of the application. First, we wish
for users to have the ability to create any asset-type 
they wish to create, coupled with the ability to tie 
assets together via contextual baskets. After that, 
the management of assets will eventually evolve to 
the management of individual assets (minting additional, 
etc.), analytics about particular assets, and the ability 
to import existing assets created outside of the minter 
application. Coupled with this could be plugins that 
enable creative ways of using particular assets such 
as an external marketplace to buy and sell NFTs, 
DAO-applications that allow you to vote directly from the 
management console or even games. Identity and profiles 
will be an element to also explore in future iterations. 


### Baseline Features, Designs, and Requirements

<img src="https://i.imgur.com/sggu3XJ.png"
     alt="Initial Diagrams"> 
     
#### First Release Requirements 
- Basic front-end
- FA2 contract to support the creation of NFTs 
  - Ability to add images via hosted / IPFS
- Wallet integration
- Ability to pay for the transaction with the connected wallet
- Token management administrative panel 
  - Details on a particular asset
  - Ability to transfer the asset to a different address
  
#### First Release Low-Level Requirements 
- Metadata related to created NFTs
     - Simple name
     - Description
     - Symbol
     - Attributes (General key-value pairs)
     - URL (IPFS image)
- Contract with standard FA2 entry points
- Backend 
     - Sandbox
     - Indexer
     - Database 
     - Server
- Frontend
     - React
     - Snowpack
- Queries and Mutations (GraphQL)
     - Tokens based on User ID / tz address
     - NFT by ID to pull information
- Exploration into Beacon 
     - User to sign transactions and transfer operations
- Exploration into IPFS
     - Image hosting and calling for NFTs
  
