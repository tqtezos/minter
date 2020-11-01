/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { Modal, Typography, Form, Input, Button } from 'antd';
import { keyHashValidator } from '../common/validators';

const { Paragraph } = Typography;

interface Props {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
}

const AssetTransfer: FC<Props> = ({ visible, onCancel, onOk }) => (
  <Modal visible={visible} footer={null} onCancel={onCancel} width={400}>
    <Paragraph strong css={{ textAlign: 'center' }}>
      Where would you like to transfer this token?
    </Paragraph>
    <Paragraph type="secondary" css={{ textAlign: 'center' }}>
      NOTE: All transfers are permanent
    </Paragraph>
    <Form layout="vertical" onFinish={onOk}>
      <Form.Item
        name="address"
        label="Account"
        css={{ marginTop: '3em' }}
        rules={[keyHashValidator]}
      >
        <Input placeholder="Enter Tezos Account Here" />
      </Form.Item>
      <Form.Item
        wrapperCol={{ offset: 2, span: 20 }}
        css={{ marginTop: '5em' }}
      >
        <Button
          htmlType="submit"
          type="primary"
          size="middle"
          css={{ width: '100%' }}
        >
          Transfer
        </Button>
      </Form.Item>
    </Form>
  </Modal>
);

export default AssetTransfer;
