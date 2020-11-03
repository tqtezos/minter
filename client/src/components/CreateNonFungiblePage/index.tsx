/** @jsx jsx */
import { FC, Fragment } from 'react';
import { jsx } from '@emotion/core';
import { Row, Col, Alert } from 'antd';
import { useLocation } from 'wouter';

import Page from '../Page';
import PageTitle from '../common/PageTitle';
import Form from './Form';
import WalletConnector from '../WalletConnector';
import { useWalletAddress } from '../App/globalContext';

const NotConnectedAlert: FC = () => (
  <Alert
    css={{ marginTop: '3em', marginBottom: '3em', width: '50em' }}
    type="error"
    message="Cannot create tokens!"
    description="To create tokens please connect to your wallet first."
    showIcon
  />
);

const CreateNonFungiblePage: FC = () => {
  const [, setLocation] = useLocation();
  const walletAddress = useWalletAddress();

  return (
    <Page>
      <PageTitle
        title="Create a Non-Fungible Token"
        description="What properties would you like to give it?"
        onClick={() => {
          setLocation('/');
        }}
      />
      <Row align="top" justify="start">
        <Col offset={3} span={18}>
          {walletAddress ? (
            <Form
              onFinish={() => {
                setLocation('/assets');
              }}
            />
          ) : (
            <Fragment>
              <NotConnectedAlert />
              <WalletConnector />
            </Fragment>
          )}
        </Col>
      </Row>
    </Page>
  );
};

export default CreateNonFungiblePage;
