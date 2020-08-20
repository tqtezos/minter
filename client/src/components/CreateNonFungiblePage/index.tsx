/** @jsx jsx */
import { FC, useState } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Row, Col as AntCol } from 'antd';

import Page from '../Page';
import PageTitle from '../common/PageTitle';
import Form from './Form';
import { useLocation } from 'wouter';
import { UploadChangeParam } from 'antd/lib/upload';

const Col = styled(AntCol)({
  padding: '2em 3em 0 0'
});

const CreateNonFungiblePage: FC = () => {
  const [, setLocation] = useLocation();
  const [imageUrl, setImageUrl] = useState<string>();

  const onChange = (info: UploadChangeParam) => {
    if (info.file.status === 'done') {
      const reader = new FileReader();
      reader.addEventListener('load', () => { setImageUrl(reader.result as string) });
      reader.readAsDataURL(info.file.originFileObj as Blob);    
    }    
    
    console.log(JSON.stringify(info, null, 2));
  }

  return (
    <Page>
      <PageTitle 
        title="Create a Non-Fungible Token" 
        description="What properties would you like to give it?"
        onClick={() => {setLocation('/')}}
      />
      <Row align="top" justify="start">
        <Col><Form onChange={onChange} /></Col>
        <Col>
          <img
            src={imageUrl}
            alt="Test"
            css={{
              height: '14em',
              width: '14em',
            }}
          />
        </Col>
      </Row>
    </Page>
  );
};

export default CreateNonFungiblePage;
