/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { useLocation } from 'wouter';
import { Row, Col } from 'antd';

import { useWalletAddress } from '../App/globalContext';
import Page from '../Page';
import PageTitle from '../common/PageTitle';
import Assets from './Assets';
import NotConnectedAlert from '../common/NotConnectedAlert';

const AssetsPage: FC = () => {
  const [, setLocation] = useLocation();
  const walletAddress = useWalletAddress();

  return (
    <Page>
      <PageTitle
        title="Assets"
        description="Your assets on the Tezos blockchain"
        onClick={() => {
          setLocation('/');
        }}
      />
      {walletAddress ? (
        <Assets />
      ) : (
        <Row>
          <Col offset={3} span={18}>
            <NotConnectedAlert
              message="Cannot show assets!"
              description="To see your assets please connect to your wallet first."
            />
          </Col>
        </Row>
      )}
    </Page>
  );
};

export default AssetsPage;
