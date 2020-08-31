/** @jsx jsx */
import { FC, useState } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Row, Col as AntCol } from 'antd';
import { useLocation } from 'wouter';

import Page from '../Page';
import PageTitle from '../common/PageTitle';
import Form from './Form';
import ImagePreview from './ImagePreview';
import { IpfsContent } from '../../api/ipfsUploader';

const Col = styled(AntCol)({
  padding: '2em 3em 0 0'
});

const CreateNonFungiblePage: FC = () => {
  const [, setLocation] = useLocation();
  const [ipfsContent, setIpfsContent] = useState<IpfsContent>();

  return (
    <Page>
      <PageTitle 
        title="Create a Non-Fungible Token" 
        description="What properties would you like to give it?"
        onClick={() => {setLocation('/')}}
      />
      <Row align="top" justify="start">
        <Col offset={3}>
          <Form ipfsContent={ipfsContent} onChange={info => setIpfsContent(info)} />
        </Col>
        <Col><ImagePreview ipfsContent={ipfsContent} /></Col>
      </Row>
    </Page>
  );
};

export default CreateNonFungiblePage;
