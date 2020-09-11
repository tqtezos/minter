/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Row, Col } from 'antd';

import { urlFromCid } from '../../api/ipfsUploader';

const Card = styled.div({
  width: '20em',
  height: '10em',
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
  letterSpacing: '-0.02em',
});

const Body = styled.div({
  fontFamily: 'sans-serif',
  fontWeight: 500,
  fontSize: '12px',
  letterSpacing: '-0.02em',
  color: '#838393'
});
  
interface AssetCardProps {
  tokenId: string;
  symbol: string;
  name: string;
  ipfsCid: string;
}

const rowGutter: [number, number] = [8, 8];

const AssetCard: FC<AssetCardProps> = ({tokenId, symbol, name, ipfsCid}) => (
  <Card>
    <Row gutter={rowGutter} align="middle">
      <Col span={8}>
        <Image src={urlFromCid(ipfsCid)} alt="token" />
      </Col>
      <Col span={8}><Header>{name}</Header></Col>
      <Col span={8}><Header>{symbol}</Header></Col>
    </Row>
    <Row gutter={rowGutter}>
      <Col offset={8}><Body>Token ID: {tokenId}</Body></Col>
    </Row>
    <Row gutter={rowGutter}>
      <Col offset={8}><Body>Number of Holders: 1</Body></Col>
    </Row>
  </Card>
);

export default AssetCard;