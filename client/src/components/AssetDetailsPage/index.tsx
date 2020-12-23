/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';

import Page from '../Page';
import PageTitle from '../common/PageTitle';

interface Props {
  contractAddress: string;
  tokenId: number;
}

const AssetDetailsPage: FC<Props> = ({ contractAddress, tokenId }) => {
  return (
    <Page>
      <PageTitle
        title="Tezos Logo Tiken"
        description="Some Description"
        onClick={() => {
          window.history.back();
        }}
      />
      <div>Contract Address: {contractAddress}</div>
      <div>Token ID: {tokenId}</div>
    </Page>
  );
};

export default AssetDetailsPage;
