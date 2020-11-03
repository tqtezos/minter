/** @jsx jsx */
import { FC, useState } from 'react';
import { jsx } from '@emotion/core';
import { useLocation } from 'wouter';
import { Row, Col, Spin } from 'antd';
import { Zoom } from 'react-awesome-reveal';

import Page from '../Page';
import PageTitle from '../common/PageTitle';
import { useNftsQuery } from './useNftsQuery';
import AssetCard from './AssetCard';
import ContractsFilter from './ContractsFilter';
import ContractsTitle from './ContractsTitle';
import { NonFungibleToken } from '../../generated/graphql_schema';
import { ContractInfo } from '../../generated/graphql_schema';

const Spinner = () => (
  <div css={{ marginTop: '5em' }}>
    <Spin size="large" />
    <div>Loading Assets...</div>
  </div>
);

const AssetCards: FC<{ data: NonFungibleToken[] }> = ({ data }) => (
  <Row gutter={[24, 24]}>
    <Zoom cascade triggerOnce damping={0.1} duration={300} fraction={0.01}>
      {data.map(t => (
        <Col key={t.token_id}>
          <AssetCard
            tokenId={t.token_id}
            symbol={t.symbol}
            name={t.name}
            ipfsCid={t.extras.ipfs_cid}
          />
        </Col>
      ))}
    </Zoom>
  </Row>
);

const AssetsPage: FC = () => {
  const [, setLocation] = useLocation();
  const [contractInfo, setContractInfo] = useState<ContractInfo>();
  const { data, loading } = useNftsQuery(contractInfo?.address);

  return (
    <Page>
      <PageTitle
        title="Assets"
        description="Your assets on the Tezos blockchain"
        onClick={() => {
          setLocation('/');
        }}
      />
      <Row>
        <Col offset={3} span={18}>
          <ContractsFilter
            address={contractInfo?.address}
            onChange={setContractInfo}
          />
        </Col>
      </Row>
      <Row>
        <Col offset={3} span={18}>
          <ContractsTitle contract={contractInfo} />
        </Col>
      </Row>
      <Row css={{ marginTop: '2em' }}>
        <Col offset={3} span={18} css={{ height: '100%' }}>
          {data && !loading ? <AssetCards data={data.nftsBcd} /> : <Spinner />}
        </Col>
      </Row>
    </Page>
  );
};

export default AssetsPage;
