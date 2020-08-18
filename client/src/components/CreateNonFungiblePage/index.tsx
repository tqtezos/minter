/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Row, Col as AntCol } from 'antd';

import Page from '../Page';
import PageTitle from '../common/PageTitle';
import Form from './Form';
import { useLocation } from 'wouter';

const Col = styled(AntCol)({
  padding: '2em 3em 0 0'
});

const CreateNonFungiblePage: FC = () => {
  const [, setLocation] = useLocation();

  return (
    <Page>
      <PageTitle 
        title="Create a Non-Fungible Token" 
        description="What properties would you like to give it?"
        onClick={() => {setLocation('/')}}
      />
      <Row align="top" justify="start">
        <Col><Form /></Col>
        <Col>Image Preview</Col>
      </Row>
    </Page>
  );
};

export default CreateNonFungiblePage;
