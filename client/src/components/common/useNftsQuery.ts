import { useWalletAddress } from '../App/globalContext';
import useAsync from '../../utils/useAsync';
import { nfts } from '../../resolvers/nfts';
import * as config from '../../config/minter.testnet.json';

console.log(config);

const settings = {
  rpc: 'https://delphinet-tezos.giganode.io',
  bcdApiUrl: 'https://api.better-call.dev',
  bcdGuiUrl: 'https://better-call.dev',
  bcdNetwork: 'delphinet',
  contracts: {
    nftFaucet: 'KT1CV1zsMnrnVHHZLKGdZ16bpSKhXfbJ8G8T',
    nftFactory: 'KT1HDdJAXVxi3scXydzhLZio2KipbyPJSru5'
  }
};

export const useNftsQuery = (contractAddress?: string) => {
  const ownerAddress = useWalletAddress();

  return useAsync(
    () =>
      nfts(
        ownerAddress,
        contractAddress,
        settings.contracts.nftFactory,
        settings.contracts.nftFaucet,
        settings.bcdApiUrl,
        settings.bcdNetwork
      ),
    []
  );
};
