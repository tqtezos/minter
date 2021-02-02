import { createAsyncThunk } from '@reduxjs/toolkit';
import { State } from '..';
import {
  createAssetContract,
  mintToken,
  transferToken
} from '../../lib/nfts/actions';
import { getContractNftsQuery, getWalletAssetContractsQuery } from './queries';
import { collectionSelectSchema } from '../validators';

type Opts = { state: State };

export const createAssetContractAction = createAsyncThunk<
  { address: string },
  string,
  Opts
>(
  'action/createAssetContract',
  async (name, { getState, rejectWithValue, dispatch }) => {
    const { system } = getState();
    if (system.status !== 'WalletConnected') {
      return rejectWithValue({ error: '' });
    }
    try {
      const op = await createAssetContract(system, name);
      await op.confirmation();
      const { address } = await op.contract();
      dispatch(getWalletAssetContractsQuery());
      return { name, address };
    } catch (e) {
      return rejectWithValue({ error: '' });
    }
  }
);

function buildMetadataFromState(state: State['createNft']) {
  const address = state.collectionAddress as string;
  const metadata: Record<string, string> = {};

  metadata.artifactUri = state.artifactUri as string;
  metadata.displayUri = state.artifactUri as string;
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
  Opts
>('actions/mintToken', async (_, { getState, rejectWithValue, dispatch }) => {
  const { system, createNft: state } = getState();
  if (collectionSelectSchema.validate(state, { allowUnknown: true }).error) {
    return rejectWithValue({ error: '' });
  } else if (system.status !== 'WalletConnected') {
    return rejectWithValue({ error: '' });
  }

  const { address, metadata } = buildMetadataFromState(state);
  try {
    const op = await mintToken(system, address, metadata);
    await op.confirmation();
    dispatch(getContractNftsQuery(address));
    return { contract: address };
  } catch (e) {
    return rejectWithValue({ error: '' });
  }
});

export const transferTokenAction = createAsyncThunk<
  { contract: string; tokenId: number },
  { contract: string; tokenId: number; to: string },
  Opts
>('actions/transferToken', async (args, api) => {
  const { getState, rejectWithValue, dispatch } = api;
  const { contract, tokenId, to } = args;
  const { system } = getState();
  if (system.status !== 'WalletConnected') {
    return rejectWithValue({ error: '' });
  }
  try {
    const op = await transferToken(system, contract, tokenId, to);
    await op.confirmation();
    dispatch(getContractNftsQuery(contract));
    return { contract: '', tokenId: 0 };
  } catch (e) {
    return rejectWithValue({ error: '' });
  }
});
