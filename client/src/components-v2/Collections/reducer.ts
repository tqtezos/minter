export interface Token {
  id: number;
  title: string;
  owner: string;
  description: string;
  ipfs_hash: string;
  metadata: Record<string, string>;
}

export interface Collection {
  name?: string;
  address: string;
  owner: string;
}

export interface State {
  selectedCollection: string | null | undefined;
  collections: Collection[];
  tokens: Record<string, Token[]>;
}

export const initialState: State = {
  selectedCollection: null,
  collections: [],
  tokens: {}
};

export type Action = {
  type: 'select_collection';
  payload: { address: string };
};

export function reducer(state: State, action: Action) {
  switch (action.type) {
    case 'select_collection': {
      return { ...state, selectedCollection: action.payload.address };
    }
    default: {
      return state;
    }
  }
}
