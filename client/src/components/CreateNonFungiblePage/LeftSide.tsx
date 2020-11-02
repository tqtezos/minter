/** @jsx jsx */
import { FC, Fragment } from 'react';
import { jsx } from '@emotion/core';
import { Form, Input, Row, Col } from 'antd';

import ImageIpfsUpload from './ImageIpfsUpload';
import { ImageIpfsUploadProps } from './ImageIpfsUpload';
import Copyable from '../common/Copyable';

const IpfsCid = ({ value }: { value?: string }) => (
  <Row align="middle">
    <Col flex={1}>
      <Input value={value} readOnly />
    </Col>
    <Col>
      <Copyable text={value} />
    </Col>
  </Row>
);

const LeftSide: FC<ImageIpfsUploadProps> = ({ onChange }) => {
  return (
    <Fragment>
      <Form.Item
        label="Name"
        name="name"
        rules={[{ required: true, message: 'Please input a name!' }]}
      >
        <Input placeholder="Tezos Logo Token" />
      </Form.Item>
      <Form.Item label="Description" name="description">
        <Input.TextArea
          placeholder="Lorem ipsum"
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Form.Item>
      <Form.Item
        label="Symbol"
        name="symbol"
        rules={[{ required: true, message: 'Please input a symbol!' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item label="Image Upload" name="image">
        <ImageIpfsUpload onChange={onChange} />
      </Form.Item>
      <Form.Item
        label="IPFS Hash (CID)"
        name="ipfsCid"
        rules={[{ required: true, message: 'Please upload an image!' }]}
      >
        <IpfsCid />
      </Form.Item>
    </Fragment>
  );
};

export default LeftSide;
