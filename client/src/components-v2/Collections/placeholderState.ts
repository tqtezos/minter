import { State } from './reducer';

const placeholderState: State = {
  selectedCollection: 'foo',
  collections: [
    {
      name: 'Minter',
      address: 'foo',
      owner: 'tz1...'
    },
    {
      name: 'Digital Art',
      address: 'bar',
      owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU'
    },
    {
      name: 'Game Rewards',
      address: 'baz',
      owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU'
    }
  ],
  tokens: {
    foo: [
      {
        id: 0,
        title: 'Cool Token',
        owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU',
        description: '',
        ipfs_hash: '...',
        metadata: {
          // Use CSS filter metadata for placeholder display distinction
          // TODO: Remove once real images are pulled from IPFS
          filter: ''
        }
      },
      {
        id: 1,
        title: 'Another Cool Token',
        owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU',
        description: '',
        ipfs_hash: '...',
        metadata: {
          filter: 'saturate(20)'
        }
      }
    ],
    bar: [
      {
        id: 0,
        title: 'Title 2',
        owner: 'tz1YPSCGWXwBdTncK2aCctSZAXWvGsGwVJqU',
        description: 'hello',
        ipfs_hash: '...',
        metadata: {
          filter: 'grayscale()'
        }
      }
    ],
    baz: [
      {
        id: 0,
        title: 'Title 3',
        owner: 'other_owner',
        description: 'hello',
        ipfs_hash: '...',
        metadata: {
          filter: 'grayscale()'
        }
      }
    ]
  }
};

export default placeholderState;
