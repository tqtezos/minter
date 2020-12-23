/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Row, Col, Button, Space } from 'antd';

import Page from '../Page';
import { BackButtonRow } from '../common/PageTitle';

const Name = styled.div({
  fontFamily: 'sans-serif',
  fontSize: '45px',
  lineHeight: '60px',
  letterSpacing: '0.75px',
  color: 'black'
});

const Description = styled.p({
  fontFamily: 'sans-serif',
  fontWeight: 300,
  fontSize: '20px',
  lineHeight: '30px',
  letterSpacing: '0.75px',
  color: 'black'
});

const ParamName = styled.span({
  fontFamily: 'sans-serif',
  fontWeight: 300,
  fontSize: '20px',
  lineHeight: '30px',
  letterSpacing: '0.75px',
  color: 'black'
});

const ParamValue = styled.span({
  fontFamily: 'sans-serif',
  fontStyle: 'italic',
  fontWeight: 300,
  fontSize: '20px',
  lineHeight: '30px',
  letterSpacing: '0.75px',
  color: 'black'
});

interface Props {
  contractAddress: string;
  tokenId: number;
}

const AssetDetailsPage: FC<Props> = ({ contractAddress, tokenId }) => {
  return (
    <Page>
      <BackButtonRow onClick={() => window.history.back()} />
      <Row>
        <Col offset={3} span={18}>
          <Row>
            <Col offset={12} span={12}>
              <Name>Tezos Logo Token</Name>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <img
                css={{
                  maxWidth: '90%',
                  padding: '1em',
                  border: 'solid 1px'
                }}
                src="http://127.0.0.1:8080/ipfs/QmaM2yDYdE3kKDtr7Ezo3QCdfKsDmULVUkWAsrtECcEfNw"
                alt="Logo"
              />
            </Col>
            <Col span={12}>
              <Description>
                A standard Tezos logo represented as an NFT on the Tezos
                blockchain.
              </Description>

              <div>
                <ParamName>Type: </ParamName>
                <ParamValue>Digital Art</ParamValue>
              </div>

              <div>
                <ParamName>Collection: </ParamName>
                <ParamValue>Alex's Tokens</ParamValue>
              </div>

              <div>
                <ParamName>Owner: </ParamName>
                <ParamValue>tz1cxrH5MSHZ3QP4UJsJqwBp2rA</ParamValue>
              </div>

              <div css={{ marginTop: '4em' }}>
                <ParamName>History: </ParamName>
              </div>
            </Col>
          </Row>
          <Row>
            <Col offset={12} span={12}>
              <Space
                size="middle"
                direction="vertical"
              >
                <div>
                  <ParamName>STATUS: </ParamName>
                  <ParamName css={{ fontWeight: 'bold', color: 'red' }}>
                    NOT FOR SALE
                  </ParamName>
                </div>

                <Button
                  type="primary"
                  shape="round"
                  size="large"
                  css={{ width: '10em' }}
                >
                  List For Sale
                </Button>
              </Space>
            </Col>
          </Row>
        </Col>
      </Row>
    </Page>
  );
};

export default AssetDetailsPage;
