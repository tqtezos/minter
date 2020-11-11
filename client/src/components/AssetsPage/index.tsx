/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { useLocation } from 'wouter';
import { Alert, Row, Col } from 'antd';
import { AttentionSeeker } from 'react-awesome-reveal';

import { useWalletAddress } from '../App/globalContext';
import WalletConnector from '../WalletConnector';
import Page from '../Page';
import PageTitle from '../common/PageTitle';
import Assets from './Assets';

const NotConnectedAlert: FC = () => (
  <Row>
    <Col offset={3} span={18}>
      <AttentionSeeker effect="headShake">
        <Alert
          css={{ marginTop: '3em', marginBottom: '3em', width: '50em' }}
          type="error"
          message="Cannot show assets!"
          description="To see your assets please connect to your wallet first."
          showIcon
        />
      </AttentionSeeker>
      <WalletConnector />
    </Col>
  </Row>
);

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
      {walletAddress ? <Assets /> : <NotConnectedAlert />}
    </Page>
  );
};

export default AssetsPage;
