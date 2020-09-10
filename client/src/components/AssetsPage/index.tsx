/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { useLocation } from 'wouter';
import { Row, Col } from 'antd';

import Page from '../Page';
import PageTitle from '../common/PageTitle';
import useNftsQuery from './useNftsQuery';

const AssetsPage: FC = () => {
  const [, setLocation] = useLocation();
  const { data, loading } = useNftsQuery();

  if(loading) return <div>Waiting...</div>;

  return (
    <Page>
      <PageTitle 
        title="Assets" 
        description="Your assets on the Tezos blockchain"
        onClick={() => { setLocation('/') }}
      />
      <Row>
        <Col offset={3}>
          <div>Non-Fungible Tokens</div>
          <ul>
            {data?.nfts?.map(t => 
              <li>{t?.token_id} {t?.symbol} {t?.name} {t?.extras.ipfs_cid}</li>
            )}
          </ul>
        </Col>
      </Row>
    </Page>
  );
};

export default AssetsPage;
