/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { Row, Col } from 'antd';
import { useLocation } from 'wouter';

import Page from '../Page';
import PageTitle from '../common/PageTitle';
import Form from './Form';
import { useWalletAddress } from '../App/globalContext';
import NotConnectedAlert from '../common/NotConnectedAlert';

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
            <NotConnectedAlert
              message="Cannot create tokens!"
              description="To create tokens please connect to your wallet first."
            />
          )}
        </Col>
      </Row>
    </Page>
  );
};

export default CreateNonFungiblePage;
