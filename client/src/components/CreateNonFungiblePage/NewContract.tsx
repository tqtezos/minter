/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { Modal, Typography, Form, Input, Button } from 'antd';
import { useForm } from 'antd/lib/form/Form';

const { Paragraph } = Typography;

interface Props {
  visible: boolean;
  onCancel: () => void;
  onOk: (contractName: string) => void;
}

const NewContract: FC<Props> = ({ visible, onCancel, onOk }) => {
  const [form] = useForm();

  const handleFinish = (values: any) => {
    form.resetFields();
    onOk(values.newContractName);
  };

  return (
    <Modal visible={visible} footer={null} onCancel={onCancel} width={400}>
      <Paragraph strong css={{ textAlign: 'center' }}>
        Create a new contract
      </Paragraph>
      <Paragraph type="secondary" css={{ textAlign: 'center' }}>
        NOTE: All contracts are permanent
      </Paragraph>
      <Form layout="vertical" form={form} onFinish={handleFinish}>
        <Form.Item
          name="newContractName"
          label="New Contract Name"
          css={{ marginTop: '3em' }}
          rules={[{ required: true, message: 'Please enter a contract name!' }]}
        >
          <Input placeholder="Enter New Contract Name Here" />
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
            Create Contract
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default NewContract;
