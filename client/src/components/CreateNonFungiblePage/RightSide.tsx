/** @jsx jsx */
import { FC, Fragment, useEffect } from 'react';
import { jsx } from '@emotion/core';
import { Form, Input, Select, Button, message } from 'antd';
import { FormInstance } from 'antd/lib/form/hooks/useForm';

import ImagePreview from './ImagePreview';
import { IpfsContent } from '../../api/ipfsUploader';
import { useContracts } from '../App/globalContext';
import { useContractNamesQuery } from './useContractNamesQuery';

const { Option } = Select;
interface Props {
  ipfsContent?: IpfsContent;
  form: FormInstance;
}

const RightSide: FC<Props> = ({ ipfsContent, form }) => {
  const contracts = useContracts();
  const { data, loading, refetch } = useContractNamesQuery();

  useEffect(() => {
    if (data) {
      const oldAddress = form.getFieldValue('contract');

      if (!data.contractNamesByOwner.find(c => c.address === oldAddress))
        form.setFieldsValue({
          contract: data.contractNamesByOwner[0].address
        });
    } else {
      form.setFieldsValue({ contract: undefined });
    }
  }, [data]);

  const handleCreateContract = async () => {
    const hideMessage = message.loading(
      'Creating a new contract on blockchain...',
      0
    );

    try {
      const factory = await contracts!.nftFactory();

      const address = await factory.createNftContract(
        form.getFieldValue('newContractName')
      );

      message.success(`Succesfuly created a new contract ${address}`);
      console.log(address);

      form.setFieldsValue({ contract: address, newContractName: undefined });
      refetch();
    } catch (error) {
      message.error(error.message, 10); // Keep for 10 seconds
    } finally {
      hideMessage();
    }
  };

  return (
    <Fragment>
      <Form.Item label="Contract" name="contract">
        <Select loading={loading}>
          {data?.contractNamesByOwner.map(c => (
            <Option key={c.address} value={c.address}>
              {c.name} - {c.address}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item label="New Contract Name" name="newContractName">
        <Input />
      </Form.Item>
      <Form.Item>
        <Button
          disabled={!contracts}
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