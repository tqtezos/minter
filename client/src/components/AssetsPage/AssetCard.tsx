/** @jsx jsx */
import { FC, Fragment, useState } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Row, Col, Typography, Button, message } from 'antd';
import { BigNumber } from 'bignumber.js';

import Copyable from '../common/Copyable';
import { NonFungibleToken } from '../../generated/graphql_schema';
import { urlFromCid } from '../../api/ipfsUploader';
import AssetTransfer from './AssetTransfer';
import { useContracts } from '../App/globalContext';
import useSettings from '../common/useSettings';

const { Paragraph, Text, Link } = Typography;

const Card = styled.div({
  width: '22em',
  height: '12em',
  border: '1px solid #E8E8E8',
  padding: '1em'
});

const Image = styled.img({
  maxWidth: '4em',
  maxHeight: '4em'
});

const Header: FC = ({ children }) => (
  <Paragraph
    ellipsis={{ rows: 2 }}
    css={{
      fontWeight: 300,
      fontSize: '18px',
      letterSpacing: '-0.02em',
      lineHeight: '100%'
      // width: '15em'
    }}
  >
    {children}
  </Paragraph>
);

const Body: FC = ({ children }) => (
  <Text
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
  </Text>
);

interface Props {
  token: NonFungibleToken;
  onChange: () => void;
}

const AssetCard: FC<Props> = ({ token, onChange }) => {
  const [transferVisible, setTransferVisible] = useState(false);
  const contracts = useContracts();
  const { settings } = useSettings();

  const handleTransfer = () => {
    if (!contracts) {
      setTransferVisible(false);
      message.error(
        'Please connect to your wallet first in order to do transfers!'
      );
    } else {
      setTransferVisible(true);
    }
  };

  const handleOk = async (values: { address: string }) => {
    setTransferVisible(false);
    console.log('Submitted address:', values.address);

    if (!contracts) {
      message.error(
        'Please connect to your wallet first in order to do transfers!'
      );
      return;
    }

    const hideMessage = message.loading(
      `Transfering token ${token.tokenId} to ${values.address}`,
      0
    );

    try {
      const nft = await contracts.nft();
      const contract = await nft.contractByAddress(token.contractInfo.address);
      await contract.transferToken({
        to: values.address,
        tokenId: new BigNumber(token.tokenId)
      });

      setTimeout(onChange, 0);
    } catch (error) {
      message.error(error.message, 10); // Keep for 10 seconds
    } finally {
      hideMessage();
    }
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
            <Link
              title={token.extras.ipfs_cid}
              href={urlFromCid(token.extras.ipfs_cid)}
              target="_blank"
            >
              <Image src={urlFromCid(token.extras.ipfs_cid)} alt="token" />
            </Link>
          </Col>
          <Col span={18}>
            <Row gutter={[8, 16]} css={{ height: '3.5em' }}>
              <Col span={15}>
                <Header>{token.name}</Header>
              </Col>
              <Col span={9}>
                <Header>{token.symbol}</Header>
              </Col>
            </Row>
            <Row>
              <Col>
                <Body>
                  Contract:{' '}
                  <Link
                    title={token.contractInfo.address}
                    href={`${settings?.bcdGuiUrl}/${settings?.bcdNetwork}/${token.contractInfo.address}`}
                    target="_blank"
                  >
                    {token.contractInfo.name} - {token.contractInfo.address}
                  </Link>
                </Body>
                <Copyable text={token.contractInfo.address} />
              </Col>
            </Row>
            <Row>
              <Col>
                <Body>
                  IPFS:{' '}
                  <Link
                    title={token.extras.ipfs_cid}
                    href={urlFromCid(token.extras.ipfs_cid)}
                    target="_blank"
                  >
                    {token.extras.ipfs_cid}
                  </Link>
                </Body>
                <Copyable text={token.extras.ipfs_cid} />
              </Col>
            </Row>
            <Row>
              <Col>
                <Body>Token ID: {token.tokenId}</Body>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={[8, 8]}>
          <Col span={12} css={{ textAlign: 'center' }}>
            <Button type="link" onClick={handleTransfer}>
              TRANSFER
            </Button>
          </Col>
          <Col span={12} css={{ display: 'flex', alignItems: 'center' }}>
            <Link
              css={{ margin: 'auto' }}
              href={`${settings?.bcdGuiUrl}/${settings?.bcdNetwork}/${token.contractInfo.address}`}
              target="_blank"
            >
              DETAILS
            </Link>
          </Col>
        </Row>
      </Card>
    </Fragment>
  );
};

export default AssetCard;
