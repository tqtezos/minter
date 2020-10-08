/** @jsx jsx */
import { FC, Fragment } from 'react';
import { jsx } from '@emotion/core';
import { Form, Input, Select, Button, message } from 'antd';
import { FormInstance } from 'antd/lib/form/hooks/useForm';

import ImagePreview from './ImagePreview';
import { IpfsContent } from '../../api/ipfsUploader';
import { useContracts } from '../App/globalContext';

const { Option } = Select;
interface Props {
  ipfsContent?: IpfsContent;
  form: FormInstance;
}

const RightSide: FC<Props> = ({ ipfsContent, form }) => {
  const contracts = useContracts();

  const handleCreateContract = async () => {
    try {
      const factory = await contracts!.nftFactory();

      const address = await factory.createNftContract(
        form.getFieldValue('newContractName')
      );

      message.success(`Succesfuly created a new contract ${address}`);
      console.log(address)
    } catch (error) {
      message.error(error.message, 10); // Keep for 10 seconds
    }
  };

  return (
    <Fragment>
      <Form.Item
        label="Contract"
        name="contract"
        initialValue="KT1EbnHDXA8C1PCdgkwA95PgaPbENkZJBeyC"
      >
        <Select>
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
          onClick={handleCreateContract}
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
