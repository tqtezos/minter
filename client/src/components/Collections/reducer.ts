import { produce } from 'immer';

export interface Token {
  id: number;
  title: string;
  owner: string;
  description: string;
  ipfs_hash: string;
  metadata: Record<string, string>;
}

export interface Collection {
  address: string;
  metadata: Record<string, string>;
  tokens: Token[] | null;
}

export interface State {
  selectedCollection: string | null;
  globalCollection: string;
  collections: Record<string, Collection>;
}

export const initialState: State = {
  selectedCollection: null,
  globalCollection: 'KT1TuCU1wHQHoWBxFSnXLVk1h1kY7JJ19tKj',
  collections: {
    KT1TuCU1wHQHoWBxFSnXLVk1h1kY7JJ19tKj: {
      address: 'KT1TuCU1wHQHoWBxFSnXLVk1h1kY7JJ19tKj',
      metadata: {
        name: 'Minter'
      },
      tokens: null
    }
  }
};

export type Action =
  | {
      type: 'update_collections';
      payload: { collections: Collection[] };
    }
  | {
      type: 'select_collection';
      payload: { address: string };
    }
  | {
      type: 'populate_collection';
      payload: { address: string; tokens: Token[] };
    };

export function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'update_collections': {
      return produce(state, draftState => {
        for (let collection of action.payload.collections) {
          draftState.collections[collection.address] = {
            ...collection,
            tokens: null
          };
        }
      });
    }
    case 'select_collection': {
      return { ...state, selectedCollection: action.payload.address };
    }
    case 'populate_collection': {
      const { address, tokens } = action.payload;
      return produce(state, draftState => {
        if (state.collections[address]) {
          draftState.collections[address].tokens = tokens;
        }
      });
    }
    default: {
      return state;
    }
  }
}
