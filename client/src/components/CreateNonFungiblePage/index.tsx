/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { Row, Col } from 'antd';
import { useLocation } from 'wouter';

import Page from '../Page';
import PageTitle from '../common/PageTitle';
import Form from './Form';

const CreateNonFungiblePage: FC = () => {
  const [, setLocation] = useLocation();

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
          <Form
            onFinish={() => {
              setLocation('/assets');
            }}
          />
        </Col>
      </Row>
    </Page>
  );
};

export default CreateNonFungiblePage;
