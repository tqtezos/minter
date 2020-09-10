/** @jsx jsx */
import { FC, useEffect } from 'react';
import { jsx } from '@emotion/core';
import { Form, Input, Button, message } from 'antd';
import ImageIpfsUpload, { ImageIpfsUploadProps } from './ImageIpfsUpload';
import { IpfsContent } from '../../api/ipfsUploader';
import useCreateMutation from './useCreateMutation';

interface InputFormProps extends ImageIpfsUploadProps {
  ipfsContent?: IpfsContent;
  onFinish: () => void;
}

const InputForm: FC<InputFormProps> = ({ ipfsContent, onChange, onFinish }) => {
  const { createNonFungibleToken, data, loading } = useCreateMutation();
  const [form] = Form.useForm();


  const handleFinish = (values: any) => {
    console.log('Submitted values: ', values);
    
    createNonFungibleToken({
      variables: {
        ...values,
        description: values.description || ''
      }
    }).catch(
      error =>  message.error(error.message)
    );
  };

  useEffect(() => {
      form.setFieldsValue({ ipfsCid: ipfsContent?.cid });
    }, 
    [ipfsContent, form]
  );

  useEffect(() => {
      if(data) {
        console.log('Reveived data: ', data);
        onFinish();
      }
    }, 
    [data, onFinish]
  );

  return (
    <Form 
      form={form}
      onFinish={handleFinish}
      layout="vertical" 
      css={{ width: '30em' }}
    >
      <fieldset disabled={loading}>
        <Form.Item 
          label="Onwer Address" 
          name="ownerAddress" 
          rules={[{ required: true, message: 'Please input an owner address!' }]}
        >
          <Input placeholder="tz1..." />
        </Form.Item>
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
            loading={loading}
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
