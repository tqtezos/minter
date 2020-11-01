/** @jsx jsx */
import { FC, Fragment, useState } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Row, Col, Typography, Button } from 'antd';
import { BigNumber } from 'bignumber.js';

import Copyable from '../common/Copyable';
import { NonFungibleToken } from '../../generated/graphql_schema';
import { urlFromCid } from '../../api/ipfsUploader';
import AssetTransfer from './AssetTransfer';
import { useContracts } from '../App/globalContext';
import useSettings from '../common/useSettings';

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
      width: '15em'
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
  const contracts = useContracts();
  const { settings } = useSettings();

  const handleOk = async (values: { address: string }) => {
    setTransferVisible(false);
    console.log('Submitted address:', values.address);
    if (!contracts) return;

    const nft = await contracts.nft();
    const contract = await nft.contractByAddress(contractInfo.address);
    await contract.transferToken({
      to: values.address,
      tokenId: new BigNumber(tokenId)
    });
  };

  return (
    <Fragment>
      <AssetTransfer
        visible={transferVisible}
        onCancel={() => setTransferVisible(false)}
        onOk={handleOk}
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
                <Copyable text={contractInfo.address} />
              </Col>
            </Row>
            <Row>
              <Col>
                <Body>IPFS: {extras.ipfs_cid}</Body>
                <Copyable text={extras.ipfs_cid} />
              </Col>
            </Row>
            <Row>
              <Col>
                <Body>Token ID: {tokenId}</Body>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={[8, 8]}>
          <Col span={12} css={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => setTransferVisible(true)}>
              TRANSFER
            </Button>
          </Col>
          <Col span={12} css={{ textAlign: 'center' }}>
            <Typography.Link
              href={`${settings?.tzStatsUrl}/${contractInfo.address}`}
              target="_blank"
            >
              DETAILS
            </Typography.Link>
          </Col>
        </Row>
      </Card>
    </Fragment>
  );
};

export default AssetCard;
