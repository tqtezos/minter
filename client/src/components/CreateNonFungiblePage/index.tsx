import React, { FC } from 'react';
import styled from '@emotion/styled';
import { Row, Col as AntCol } from 'antd';

import Page from '../Page';
import PageTitle from '../common/PageTitle';
import { NonFungibleIcon } from '../BigIcon'
import Form from './Form';

const Col = styled(AntCol)({
  padding: '1em 3em'
});

const CreateNonFungiblePage: FC = () => (
  <Page>
    <PageTitle 
      title="Create a Non-Fungible Token" 
      description="What properties would you like to give it?" 
    />
    <Row align="top" justify="start">
      <Col><NonFungibleIcon/></Col>
      <Col><Form /></Col>
      <Col>Picture</Col>
    </Row>
  </Page>
);

export default CreateNonFungiblePage;
