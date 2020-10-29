/** @jsx jsx */
import { FC, Fragment, useState } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Row, Col, Typography, Button } from 'antd';

import { NonFungibleToken } from '../../generated/graphql_schema';
import { urlFromCid } from '../../api/ipfsUploader';
import AssetTransfer from './AssetTransfer';

const Card = styled.div({
  width: '22em',
  height: '11em',
  border: '1px solid #E8E8E8',
  padding: '1em'
});

const Image = styled.img({
  maxWidth: '4em',
  maxHeight: '4em'
});

const Header = styled.div({
  fontFamily: 'sans-serif',
  fontWeight: 300,
  fontSize: '18px',
  lineHeight: '100%',
  letterSpacing: '-0.02em'
});

const Body: FC = ({ children }) => (
  <Typography.Text
    type="secondary"
    ellipsis
    css={{
      fontWeight: 500,
      fontSize: '12px',
      letterSpacing: '-0.02em',
      width: '17em'
    }}
  >
    {children}
  </Typography.Text>
);

const AssetCard: FC<NonFungibleToken> = ({
  contractInfo,
  tokenId,
  symbol,
  name,
  extras
}) => {
  const [transferVisible, setTransferVisible] = useState(false);

  return (
    <Fragment>
      <AssetTransfer
        visible={transferVisible}
        onCancel={() => setTransferVisible(false)}
      />
      <Card>
        <Row align="top" gutter={[8, 8]}>
          <Col span={6}>
            <Image src={urlFromCid(extras.ipfs_cid)} alt="token" />
          </Col>
          <Col span={18}>
            <Row gutter={[8, 16]}>
              <Col>
                <Header>{name}</Header>
              </Col>
              <Col>
                <Header>{symbol}</Header>
              </Col>
            </Row>
            <Row>
              <Col>
                <Body>
                  Contract: {contractInfo.name} - {contractInfo.address}
                </Body>
              </Col>
            </Row>
            <Row>
              <Col>
                <Body>IPFS: {extras.ipfs_cid}</Body>
              </Col>
            </Row>
            <Row>
              <Col>
                <Body>Token ID: {tokenId}</Body>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={[8, 200]}>
          <Col span={12} css={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => setTransferVisible(true)}>
              TRANSFER
            </Button>
          </Col>
          <Col span={12} css={{ textAlign: 'center' }}>
            <Button type="link">DETAILS</Button>
          </Col>
        </Row>
      </Card>
    </Fragment>
  );
};

export default AssetCard;
