import useAsync from '../utils/useAsync';
import { contractNames } from '../resolvers/contractNames';
import config from '../config.json';

export const useContractNamesQuery = (
  contractOwnerAddress?: string,
  nftOwnerAddress?: string
) => {
  return useAsync(
    () =>
      contractNames(
        contractOwnerAddress,
        nftOwnerAddress,
        config.contracts.nftFactory,
        config.contracts.nftFaucet,
        config.bcdApiUrl,
        config.bcdNetwork
      ),
    []
  );
};
