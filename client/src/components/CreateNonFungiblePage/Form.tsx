/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { Form, Input, Button } from 'antd';
import ImageIpfsUpload, { ImageIpfsUploadProps } from './ImageIpfsUpload';
import { IpfsContent } from '../../api/ipfsUploader';
import { gql, useMutation } from '@apollo/client';

interface InputFormProps extends ImageIpfsUploadProps {
  ipfsContent?: IpfsContent;
}

const CREATE_NON_FUNGIBLE_TOKEN = gql`
  mutation CreateNonFungibleToken(
    $name: String!
    $description: String!
    $symbol: String!
    $ipfs_cid: String!
  ) {
    createNonFungibleToken(
      name: $name
      description: $description
      symbol: $symbol
      ipfs_cid: $ipfs_cid
    ) {
      hash
      initiator
      method
      params
      status
    }
  }
`;

const InputForm: FC<InputFormProps> = ({ ipfsContent, onChange }) => {
  const [createNonFungibleToken, { data }] = useMutation(
    CREATE_NON_FUNGIBLE_TOKEN
  );
  const [form] = Form.useForm();
  form.setFieldsValue({ ipfsCid: ipfsContent?.cid });

  // Testing the output - we'd likely want to use callbacks in the useMutation
  // hook to show the user feedback after they submit the form
  console.log(data);

  return (
    <Form form={form} layout="vertical" css={{ width: '30em' }}>
      <Form.Item label="Name" name="name">
        <Input placeholder="Tezos Logo Token" />
      </Form.Item>
      <Form.Item label="Description" name="description">
        <Input.TextArea
          placeholder="Lorem ipsum"
          autoSize={{ minRows: 3, maxRows: 6 }}
        />
      </Form.Item>
      <Form.Item label="Symbol" name="symbol">
        <Input />
      </Form.Item>
      <Form.Item label="Image Upload" name="image">
        <ImageIpfsUpload onChange={onChange} />
      </Form.Item>
      <Form.Item label="IPFS Hash (CID)" name="ipfsCid">
        <Input readOnly />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          shape="round"
          size="large"
          css={{ width: '12em' }}
          onClick={e => {
            e.preventDefault();
            createNonFungibleToken({
              variables: {
                name: form.getFieldValue('name'),
                description: form.getFieldValue('description'),
                symbol: form.getFieldValue('symbol'),
                ipfs_cid: form.getFieldValue('ipfsCid')
              }
            });
          }}
        >
          Create
        </Button>
      </Form.Item>
    </Form>
  );
};

export default InputForm;
