import { createAsyncThunk } from '@reduxjs/toolkit';
import { State } from '..';
import {
  createAssetContract,
  mintToken,
  transferToken
} from '../../lib/nfts/actions';
import { ErrorKind, RejectValue } from './errors';
import { getContractNftsQuery, getWalletAssetContractsQuery } from './queries';
import { validateCreateNftForm } from '../validators/createNft';
import { uploadIPFSFile, IpfsResponse } from '../../lib/util/ipfs';
import { SelectedFile } from '../slices/createNft';
import { AxiosResponse } from 'axios';

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

function buildMetadataFromState(state: State['createNft'], data: IpfsResponse) {
  const address = state.collectionAddress as string;
  const metadata: Record<string, string> = {};

  metadata.artifactUri = data.ipfsUri;
  metadata.displayUri = data.ipfsUri;
  metadata.thumbnailUri = data.thumbnail.ipfsUri;
  metadata.name = state.fields.name as string;

  if (state.fields.description) {
    metadata.description = state.fields.description;
  }

  for (let row of state.metadataRows) {
    if (row.name !== null && row.value !== null) {
      metadata[row.name] = row.value;
    }
  }

  return { address, metadata };
}

export const mintTokenAction = createAsyncThunk<
  { contract: string },
  undefined,
  Options
>('actions/mintToken', async (_, { getState, rejectWithValue, dispatch }) => {
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
      message: 'Could not mint token: file not found'
    });
  }

  let response: AxiosResponse<IpfsResponse>;
  try {
    response = await uploadIPFSFile(file);
  } catch (e) {
    return rejectWithValue({
      kind: ErrorKind.IPFSUploadFailed,
      message: 'IPFS upload failed'
    });
  }

  const { address, metadata } = buildMetadataFromState(state, response.data);

  try {
    const op = await mintToken(system, address, metadata);
    await op.confirmation();
    dispatch(getContractNftsQuery(address));
    return { contract: address };
  } catch (e) {
    return rejectWithValue({
      kind: ErrorKind.MintTokenFailed,
      message: 'Mint token failed'
    });
  }
});

export const transferTokenAction = createAsyncThunk<
  { contract: string; tokenId: number },
  { contract: string; tokenId: number; to: string },
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
    const op = await transferToken(system, contract, tokenId, to);
    await op.confirmation();
    dispatch(getContractNftsQuery(contract));
    return { contract: '', tokenId: 0 };
  } catch (e) {
    return rejectWithValue({
      kind: ErrorKind.TransferTokenFailed,
      message: 'Transfer token failed'
    });
  }
});
