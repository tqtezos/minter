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

type Options = {
  state: State;
  rejectValue: RejectValue;
};

export const createAssetContractAction = createAsyncThunk<
  { address: string },
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

function buildMetadataFromState(state: State['createNft']) {
  const address = state.collectionAddress as string;
  const metadata: Record<string, string> = {};

  metadata.artifactUri = state.artifactUri as string;
  metadata.displayUri = state.artifactUri as string;
  metadata.thumbnailUri = state.thumbnailUri as string;
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
  if (!validateCreateNftForm(state)) {
    return rejectWithValue({
      kind: ErrorKind.CreateNftFormInvalid,
      message: 'Could not mint token: Form validation failed'
    });
  } else if (system.status !== 'WalletConnected') {
    return rejectWithValue({
      kind: ErrorKind.WalletNotConnected,
      message: 'Could not mint token: no wallet connected'
    });
  }

  const { address, metadata } = buildMetadataFromState(state);

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
