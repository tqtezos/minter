/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { useLocation } from 'wouter';
import { Row, Col } from 'antd';
import { Zoom } from 'react-awesome-reveal'

import Page from '../Page';
import PageTitle from '../common/PageTitle';
import useNftsQuery from './useNftsQuery';
import AssetCard from './AssetCard';

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
      <Row css={{marginTop: '2em'}}>
        <Col offset={3} span={18}>
          <Row gutter={[24, 24]}>
            <Zoom 
              cascade 
              triggerOnce
              damping={0.1} 
              duration={300} 
              fraction={0.01}
            >
              {data?.nfts.map(t =>
                <Col>
                  <AssetCard
                    tokenId={t.token_id}
                    symbol={t.symbol}
                    name={t.name}
                    ipfsCid={t.extras.ipfs_cid}
                  />
                </Col>
              )}
            </Zoom>
          </Row>
        </Col>
      </Row>
    </Page>
  );
};

export default AssetsPage;
