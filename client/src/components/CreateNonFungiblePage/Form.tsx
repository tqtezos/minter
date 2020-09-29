/** @jsx jsx */
import { FC, useEffect, useState } from 'react';
import { jsx } from '@emotion/core';
import { Form, Input, Button, message } from 'antd';

import ImageIpfsUpload, { ImageIpfsUploadProps } from './ImageIpfsUpload';
import { IpfsContent } from '../../api/ipfsUploader';
import { useContracts } from '../App/globalContext';

interface InputFormProps extends ImageIpfsUploadProps {
  ipfsContent?: IpfsContent;
  onFinish: () => void;
}

const InputForm: FC<InputFormProps> = ({ ipfsContent, onChange, onFinish }) => {
  const [creatingToken, setCreatingToken] = useState(false);
  const [form] = Form.useForm();
  const contracts = useContracts();

  const handleFinish = async (values: any) => {
    // This should never happen as 'Create' button is disabled until
    // the settings are received
    if(!contracts) return;

    console.log('Submitted values: ', values);
    setCreatingToken(true);
    const hideMessage = message.loading('Creating a new non-fungible token on blockchain...', 0);
    
    try {
      const nft = await contracts.nft();
      
      await nft.createToken({
        ...values,
        description: values.description || ''
      });
      
      setTimeout(onFinish, 0);
    } catch (error) {
      message.error(error.message, 10) // Keep for 10 seconds
    } finally {
      setCreatingToken(false)
      hideMessage();
    }
  };

  useEffect(() => {
      form.setFieldsValue({ ipfsCid: ipfsContent?.cid });
    }, 
    [ipfsContent, form]
  );

  return (
    <Form 
      form={form}
      onFinish={handleFinish}
      layout="vertical" 
      css={{ width: '30em' }}
    >
      <fieldset disabled={creatingToken}>
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
          <Input readOnly />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={creatingToken}
            disabled={!contracts}
            shape="round"
            size="large"
            css={{ width: '12em' }}
          >
            Create
          </Button>
        </Form.Item>
      </fieldset>
    </Form>
  );
};

export default InputForm;
