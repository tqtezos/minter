import { createAsyncThunk } from '@reduxjs/toolkit';
import { State } from '..';
import {
  createAssetContract,
  mintToken,
  transferToken,
  listTokenForSale,
  cancelTokenSale,
  approveTokenOperator,
  buyToken
} from '../../lib/nfts/actions';
// import {getNftAssetContract} from '../../lib/nfts/queries'
import { ErrorKind, RejectValue } from './errors';
import { getContractNftsQuery, getWalletAssetContractsQuery } from './queries';
import { validateCreateNftForm } from '../validators/createNft';
import {
  uploadIPFSFile,
  uploadIPFSImageWithThumbnail
} from '../../lib/util/ipfs';
import { SelectedFile } from '../slices/createNft';
import { connectWallet } from './wallet';
import { AssetContract } from '../../lib/nfts/queries';
import { Collection, CollectionsState } from '../slices/collections';

type Options = {
  state: State;
  rejectValue: RejectValue;
};

export const readFileAsDataUrlAction = createAsyncThunk<
  { ns: string; result: SelectedFile },
  { ns: string; file: File },
  Options
>('action/readFileAsDataUrl', async ({ ns, file }, { rejectWithValue }) => {
  const readFile = new Promise<{ ns: string; result: SelectedFile }>(
    (resolve, reject) => {
      const { name, type, size } = file;
      const reader = new FileReader();
      reader.onload = e => {
        const buffer = e.target?.result;
        if (!buffer || !(buffer instanceof ArrayBuffer)) {
          return reject();
        }
        const blob = new Blob([new Uint8Array(buffer)], { type });
        const objectUrl = window.URL.createObjectURL(blob);
        return resolve({ ns, result: { objectUrl, name, type, size } });
      };
      reader.readAsArrayBuffer(file);
    }
  );
  try {
    return await readFile;
  } catch (e) {
    return rejectWithValue({
      kind: ErrorKind.UknownError,
      message: 'Could not read file'
    });
  }
});

export const createAssetContractAction = createAsyncThunk<
  { name: string; address: string },
  string,
  Options
>(
  'action/createAssetContract',
  async (name, { getState, rejectWithValue, dispatch }) => {
    const { system } = getState();
    if (system.status !== 'WalletConnected') {
      return rejectWithValue({
        kind: ErrorKind.WalletNotConnected,
        message: 'Cannot create collection: Wallet not connected'
      });
    }
    try {
      const op = await createAssetContract(system, { name });
      await op.confirmation();
      const { address } = await op.contract();
      // TODO: Poll for contract availability on indexer
      dispatch(getWalletAssetContractsQuery());
      return { name, address };
    } catch (e) {
      return rejectWithValue({
        kind: ErrorKind.CreateAssetContractFailed,
        message: 'Collection creation failed'
      });
    }
  }
);

function appendStateMetadata(
  state: State['createNft'],
  metadata: Record<string, string>
) {
  const appendedMetadata = { ...metadata };
  appendedMetadata.name = state.fields.name as string;

  if (state.fields.description) {
    appendedMetadata.description = state.fields.description;
  }

  for (let row of state.metadataRows) {
    if (row.name !== null && row.value !== null) {
      appendedMetadata[row.name] = row.value;
    }
  }

  return appendedMetadata;
}

export const mintTokenAction = createAsyncThunk<
  { contract: Collection },
  { collections: CollectionsState },
  Options
>(
  'actions/mintToken',
  async ({ collections }, { getState, rejectWithValue, dispatch }) => {
    const { system, createNft: state } = getState();
    if (state.selectedFile === null) {
      return rejectWithValue({
        kind: ErrorKind.UknownError,
        message: 'Could not mint token: no file selected'
      });
    } else if (system.status !== 'WalletConnected') {
      return rejectWithValue({
        kind: ErrorKind.WalletNotConnected,
        message: 'Could not mint token: no wallet connected'
      });
    } else if (!validateCreateNftForm(state)) {
      return rejectWithValue({
        kind: ErrorKind.CreateNftFormInvalid,
        message: 'Could not mint token: form validation failed'
      });
    }

    let file: File;
    try {
      const { objectUrl, name, type } = state.selectedFile;
      const fetched = await fetch(objectUrl);
      const blob = await fetched.blob();
      file = new File([blob], name, { type });
    } catch (e) {
      return rejectWithValue({
        kind: ErrorKind.UknownError,
        message: 'Could not mint token: selected file not found'
      });
    }

    let ipfsMetadata: Record<string, string> = {};
    try {
      if (/^image\/.*/.test(file.type)) {
        const imageResponse = await uploadIPFSImageWithThumbnail(
          system.config.ipfsApi,
          file
        );
        ipfsMetadata.artifactUri = imageResponse.data.ipfsUri;
        ipfsMetadata.displayUri = imageResponse.data.ipfsUri;
        ipfsMetadata.thumbnailUri = imageResponse.data.thumbnail.ipfsUri;
      } else if (/^video\/.*/.test(file.type)) {
        if (state.displayImageFile === null) {
          return rejectWithValue({
            kind: ErrorKind.IPFSUploadFailed,
            message: 'Ipfs upload failed: Video display file not found'
          });
        }
        let displayFile: File;
        try {
          const { objectUrl, name, type } = state.displayImageFile;
          const fetched = await fetch(objectUrl);
          const blob = await fetched.blob();
          displayFile = new File([blob], name, { type });
        } catch (e) {
          return rejectWithValue({
            kind: ErrorKind.UknownError,
            message: 'Could not mint token: video display file not found'
          });
        }
        const fileResponse = await uploadIPFSFile(system.config.ipfsApi, file);
        const imageResponse = await uploadIPFSImageWithThumbnail(
          system.config.ipfsApi,
          displayFile
        );
        ipfsMetadata.artifactUri = fileResponse.data.ipfsUri;
        ipfsMetadata.displayUri = imageResponse.data.ipfsUri;
        ipfsMetadata.thumbnailUri = imageResponse.data.thumbnail.ipfsUri;
      } else {
        return rejectWithValue({
          kind: ErrorKind.IPFSUploadFailed,
          message: 'IPFS upload failed: unknown file type'
        });
      }
    } catch (e) {
      return rejectWithValue({
        kind: ErrorKind.IPFSUploadFailed,
        message: 'IPFS upload failed'
      });
    }
    const address = state.collectionAddress as string;

    const metadata = appendStateMetadata(state, ipfsMetadata);

    try {
      const op = await mintToken(system, address, metadata);
      await op.confirmation(2);
      dispatch(
        getContractNftsQuery({
          collection: collections.collections[address],
          purge: true
        })
      );
      return { contract: collections.collections[address] };
    } catch (e) {
      return rejectWithValue({
        kind: ErrorKind.MintTokenFailed,
        message: 'Mint token failed'
      });
    }
  }
);

export const transferTokenAction = createAsyncThunk<
  { contract: Collection; tokenId: number },
  { contract: Collection; tokenId: number; to: string },
  Options
>('actions/transferToken', async (args, api) => {
  const { getState, rejectWithValue, dispatch } = api;
  const { contract, tokenId, to } = args;
  const { system } = getState();
  if (system.status !== 'WalletConnected') {
    return rejectWithValue({
      kind: ErrorKind.WalletNotConnected,
      message: 'Could not transfer token: no wallet connected'
    });
  }
  try {
    const op = await transferToken(system, contract.address, tokenId, to);
    await op.confirmation(2);
    dispatch(getContractNftsQuery({ collection: contract, purge: true }));
    return {
      contract: {
        address: '',
        tokensId: 0,
        ledgerId: 0,
        metadata: {},
        tokens: []
      },
      tokenId: 0
    };
  } catch (e) {
    return rejectWithValue({
      kind: ErrorKind.TransferTokenFailed,
      message: 'Transfer token failed'
    });
  }
});

export const listTokenAction = createAsyncThunk<
  { contract: AssetContract; tokenId: number; salePrice: number },
  { contract: AssetContract; tokenId: number; salePrice: number },
  Options
>('actions/listToken', async (args, api) => {
  const { getState, rejectWithValue, dispatch } = api;
  const { contract, tokenId, salePrice } = args;
  const { system } = getState();
  const marketplaceContract =
    system.config.contracts.marketplace.fixedPrice.tez;
  if (system.status !== 'WalletConnected') {
    return rejectWithValue({
      kind: ErrorKind.WalletNotConnected,
      message: 'Could not list token: no wallet connected'
    });
  }
  try {
    const op1 = await approveTokenOperator(
      system,
      contract.address,
      tokenId,
      marketplaceContract
    );
    await op1.confirmation();
    const op2 = await listTokenForSale(
      system,
      marketplaceContract,
      contract.address,
      tokenId,
      salePrice
    );
    await op2.confirmation(2);
    dispatch(getContractNftsQuery({ collection: contract, purge: true }));
    return { contract: contract, tokenId: tokenId, salePrice: salePrice };
  } catch (e) {
    return rejectWithValue({
      kind: ErrorKind.ListTokenFailed,
      message: 'List token failed'
    });
  }
});

export const cancelTokenSaleAction = createAsyncThunk<
  { contract: AssetContract; tokenId: number },
  { contract: AssetContract; tokenId: number },
  Options
>('actions/cancelTokenSale', async (args, api) => {
  const { getState, rejectWithValue, dispatch } = api;
  const { contract, tokenId } = args;
  const { system } = getState();
  const marketplaceContract =
    system.config.contracts.marketplace.fixedPrice.tez;
  if (system.status !== 'WalletConnected') {
    return rejectWithValue({
      kind: ErrorKind.WalletNotConnected,
      message: 'Could not list token: no wallet connected'
    });
  }
  try {
    const op = await cancelTokenSale(
      system,
      marketplaceContract,
      contract.address,
      tokenId
    );
    await op.confirmation(2);
    dispatch(getContractNftsQuery({ collection: contract, purge: true }));
    return { contract: contract, tokenId: tokenId };
  } catch (e) {
    return rejectWithValue({
      kind: ErrorKind.CancelTokenSaleFailed,
      message: 'Cancel token sale failed'
    });
  }
});

export const buyTokenAction = createAsyncThunk<
  { contract: AssetContract; tokenId: number },
  {
    contract: AssetContract;
    tokenId: number;
    tokenSeller: string;
    salePrice: number;
  },
  Options
>('actions/buyToken', async (args, api) => {
  const { getState, rejectWithValue, dispatch } = api;
  const { contract, tokenId, tokenSeller, salePrice } = args;
  let { system } = getState();
  const marketplaceContract =
    system.config.contracts.marketplace.fixedPrice.tez;
  if (system.status !== 'WalletConnected') {
    const res = await dispatch(connectWallet());
    if (!res.payload || !('wallet' in res.payload)) {
      return rejectWithValue({
        kind: ErrorKind.WalletNotConnected,
        message: 'Could not list token: no wallet connected'
      });
    }
    system = res.payload;
  }
  try {
    const op = await buyToken(
      system,
      marketplaceContract,
      contract.address,
      tokenId,
      tokenSeller,
      salePrice
    );
    await op.confirmation(2);
    dispatch(getContractNftsQuery({ collection: contract, purge: true }));
    return { contract: contract, tokenId: tokenId };
  } catch (e) {
    return rejectWithValue({
      kind: ErrorKind.BuyTokenFailed,
      message: 'Purchase token failed'
    });
  }
});
