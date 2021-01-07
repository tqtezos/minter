/** @jsx jsx */
import { FC, Fragment, useState } from 'react';
import { jsx } from '@emotion/core';
import { Row, Col, Spin } from 'antd';
import { Zoom } from 'react-awesome-reveal';

import { useNftsQuery } from '../common/useNftsQuery';
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

interface AssetCardsProps {
  data: NonFungibleToken[];
  onChange: () => void;
}

const AssetCards: FC<AssetCardsProps> = ({ data, onChange }) => (
  <Row gutter={[24, 24]}>
    <Zoom cascade triggerOnce damping={0.1} duration={300} fraction={0.01}>
      {data.map(t => (
        <Col key={`${t.contractInfo.address}:${t.tokenId}`}>
          <AssetCard token={t} onChange={onChange} />
        </Col>
      ))}
    </Zoom>
  </Row>
);

const Assets: FC = () => {
  const [contract, setContract] = useState<ContractInfo>();
  const { data, loading, refetch } = useNftsQuery(contract?.address);

  return (
    <Fragment>
      <Row>
        <Col offset={3} span={18}>
          <ContractsFilter contract={contract} onChange={setContract} />
        </Col>
      </Row>
      <Row>
        <Col offset={3} span={18}>
          <ContractsTitle contract={contract} />
        </Col>
      </Row>
      <Row css={{ marginTop: '2em' }}>
        <Col offset={3} span={18} css={{ height: '100%' }}>
          {data && !loading ? (
            <AssetCards data={data} onChange={refetch} />
          ) : (
            <Spinner />
          )}
        </Col>
      </Row>
    </Fragment>
  );
};

export default Assets;
