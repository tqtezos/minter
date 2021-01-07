import { useWalletAddress } from '../components/App/globalContext';
import useAsync from '../utils/useAsync';
import { nfts } from '../resolvers/nfts';
import config from '../config';

export const useNftsQuery = (contractAddress?: string) => {
  const ownerAddress = useWalletAddress();

  return useAsync(
    () =>
      nfts(
        ownerAddress,
        contractAddress,
        config.contracts.nftFactory,
        config.contracts.nftFaucet,
        config.bcdApiUrl,
        config.bcdNetwork
      ),
    []
  );
};
