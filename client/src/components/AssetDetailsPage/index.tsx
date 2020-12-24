/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { Row, Col, Spin, Skeleton } from 'antd';

import Page from '../Page';
import { BackButtonRow } from '../common/PageTitle';
import { Name } from './Typography';
import AssetDescription from './AssetDescription';
import Actions from './Actions';
import { useNftsQuery } from '../common/useNftsQuery';
interface Props {
  contractAddress: string;
  tokenId: number;
}

const Image: FC = () => (
  <img
    css={{
      maxWidth: '90%',
      padding: '1em',
      border: 'solid 1px'
    }}
    src="http://127.0.0.1:8080/ipfs/QmaM2yDYdE3kKDtr7Ezo3QCdfKsDmULVUkWAsrtECcEfNw"
    alt="Logo"
  />
);

const AssetDetailsPage: FC<Props> = ({ contractAddress, tokenId }) => {
  const { data, error, loading } = useNftsQuery(contractAddress);
  const nft = data?.nfts.find(t => t.tokenId === tokenId);

  return (
    <Page>
      <BackButtonRow onClick={() => window.history.back()} />

      {error && <div>GraphQL Error: {error}</div>}
      {data && !nft && (
        <div>
          Cannot find token {tokenId} in contract {contractAddress}
        </div>
      )}

      {!error && (!data || nft) && (
        <Spin spinning={loading} size="large">
          <Row>
            <Col offset={3} span={18}>
              <Row>
                <Col offset={12} span={12}>
                  {nft ? <Name>{nft.name}</Name> : <Skeleton />}
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Image />
                </Col>
                <Col span={12}>
                  <AssetDescription nft={nft} />
                </Col>
              </Row>
              <Row>
                <Col offset={12} span={12}>
                  <Actions />
                </Col>
              </Row>
            </Col>
          </Row>
        </Spin>
      )}
    </Page>
  );
};

export default AssetDetailsPage;
