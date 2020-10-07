/** @jsx jsx */
import { FC, Fragment } from 'react';
import { jsx } from '@emotion/core';
import { Form, Input, Select, Button } from 'antd';

import ImagePreview from './ImagePreview';
import { IpfsContent } from '../../api/ipfsUploader';

const { Option } = Select;

const RightSide: FC<{ ipfsContent?: IpfsContent }> = ({ ipfsContent }) => {
  return (
    <Fragment>
      <Form.Item label="Contract" name="contract">
        <Select defaultValue="KT1EbnHDXA8C1PCdgkwA95PgaPbENkZJBeyC">
          <Option value="KT1EbnHDXA8C1PCdgkwA95PgaPbENkZJBeyC">
            Faucet - KT1EbnHDXA8C1PCdgkwA95PgaPbENkZJBeyC
          </Option>
        </Select>
      </Form.Item>
      <Form.Item label="New Contract Name" name="newContractName">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button
          type="default"
          shape="round"
          size="large"
          css={{ width: '12em' }}
        >
          Create Contract
        </Button>
      </Form.Item>
      <Form.Item label="Image Preview">
        <ImagePreview ipfsContent={ipfsContent} />
      </Form.Item>
    </Fragment>
  );
};

export default RightSide;
