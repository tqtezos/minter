/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { Modal, Typography, Form, Input, Button } from 'antd';

const { Paragraph } = Typography;

interface Props {
  visible: boolean;
  onCancel: () => void;
}

const AssetTransfer: FC<Props> = ({ visible, onCancel }) => {
  return (
    <Modal
      centered
      visible={visible}
      footer={null}
      onCancel={onCancel}
      width={400}
    >
      <Paragraph strong css={{ textAlign: 'center' }}>
        Where would you like to transfer this token?
      </Paragraph>
      <Paragraph type="secondary" css={{ textAlign: 'center' }}>
        NOTE: All transfers are permanent
      </Paragraph>
      <Form layout="vertical">
        <Form.Item label="Account" css={{ marginTop: '3em' }}>
          <Input placeholder="Enter Tezos Account Here" />
        </Form.Item>
        <Form.Item
          wrapperCol={{ offset: 2, span: 20 }}
          css={{ marginTop: '5em' }}
        >
          <Button size="middle" type="primary" css={{ width: '100%' }}>
            Transfer
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AssetTransfer;
