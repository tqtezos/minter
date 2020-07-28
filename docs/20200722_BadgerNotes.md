### Notes on Badger

- The badger contract will have enough customization that 
it will not be created by the TQ Minter.

- Either at origination of the Badger contract or very soon 
after we will "issue" (meaning we will define the token 
by specifying its metadata) the first token which will 
receive token_id 1 as a fungible, non-transferrable 
"Badger Points" token but this definition does not yet 
create any supply.

- One customization Badger will have is that the Admin 
can set the whitelist of Issuers — these are addresses 
which can call the "issue" entrypoint to define new tokens 
with supplied metadata. note: currently the assumption is 
that Issuers can only add supply of tokens (by calling mint 
entrypoint with a quantity and address of the recipient) 
that they have issued themselves, effectively they are the admins 
of the tokens they define — this leaves a design decision 
around which Issuers (All, Some, based on a rules system?) 
have the authority to mint Badger Points.

- An issuer will issue a new badge token for a specific activity 
e.g. "Attend Hackathon X". The issuer will need to manage 
offchain which participants qualify to receive the badge, 
connect them to a tezos account (in simplest case simply 
ask the recipient to provide a Tezos address). The issuer 
will call the "mint" entrypoint on the contract which will 
add 1 to the total supply and assign its owner to be the 
recipients address. Additionally the issuer will likely want 
to give the recipient some n amount of Badger Points which 
requires and additional call to "mint", with a qty, and recipient 
address.

- (not yet a requirement, base solution does not need templates 
minting): To minimize the number of calls to the contract and 
to reduce data entry error when distributing badges and points 
will consider adding a "Minting Template" with an associated 
additional entrypoint "mint_template". The template would 
store a list of token id and qty (e.g. [token_id a] Attend Hackathon 
X, qty: 1; [token_id 1] Badger Points, qty: 500). Issuers would 
be able to define templates by combining any tokens they have 
issued with a qty, plus add a qty for Badger Points and call an 
entrypoint "add_template".

- Future batch mint and even batch mint_template.

For all token contracts we need to address discoverability primarily 
for indexers, explorers, and wallets. This involves metadata at 
both the dapp/contract level and for each token defined within the 
contract as well as a potential registry of such contracts for 
indexers to find (alternatively indexers can scan for certain 
contract interfaces to infer that they are token contracts but 
that still leaves the issue of curation which the registry would 
begin to address with at least a fee to reduce spam)
