# Package Scripts

1. `compile-scripts` compile all LIGO contracts with the currently installed LIGO
   compiler.

2. `bootstrap` bootstrap the network specified in `ENV_NAME` environment name.
   Check if the contract addresses in the config file are actually deployed on
   the network. If necessary, re-deploy compiled contracts and update the config
   file.

3. `bootstrap-sandbox` bootstrap flextesa sandbox network.

4. `bootstrap-testnet` bootstrap flextesa test network.
