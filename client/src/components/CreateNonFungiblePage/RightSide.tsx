/** @jsx jsx */
import { FC, Fragment, useEffect } from 'react';
import { jsx } from '@emotion/core';
import { Form, Input, Select, Button, message } from 'antd';
import { FormInstance } from 'antd/lib/form/hooks/useForm';

import ImagePreview from './ImagePreview';
import { IpfsContent } from '../../api/ipfsUploader';
import { useContracts, useWalletAddress } from '../App/globalContext';
import { useContractNamesQuery } from '../common/useContractNamesQuery';

const { Option } = Select;
interface Props {
  ipfsContent?: IpfsContent;
  form: FormInstance;
}

const RightSide: FC<Props> = ({ ipfsContent, form }) => {
  const contracts = useContracts();
  const ownerAddress = useWalletAddress();
  const { data, loading, refetch } = useContractNamesQuery(ownerAddress);
  const contractNames = data?.contractNamesBcd;

  useEffect(() => {
    if (!contractNames) form.setFieldsValue({ contract: undefined });
    else if (contractNames.length === 1)
      form.setFieldsValue({ contract: contractNames[0].address });
    else {
      const contractAddress = form.getFieldValue('contract');
      if (!contractNames.find(c => c.address === contractAddress))
        form.setFieldsValue({ contract: undefined });
    }
  }, [contractNames, form]);

  const handleCreateContract = async () => {
    try {
      await form.validateFields(['newContractName']);
    } catch (error) {
      message.error('Please provide a new contract name');
      return;
    }

    const hideMessage = message.loading(
      'Creating a new smart contract',
      0
    );

    try {
      const nft = await contracts!.nft();

      const address = await nft.createContract(
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
      <Form.Item
        label="Contract"
        name="contract"
        rules={[{ required: true, message: 'Please select a contract!' }]}
      >
        <Select loading={loading} placeholder="Select a contract">
          {data?.contractNamesBcd.map(c => (
            <Option key={c.address} value={c.address}>
              {c.name} - {c.address}
            </Option>
          ))}
        </Select>
      </Form.Item>
      <Form.Item
        label="New Contract Name"
        name="newContractName"
        rules={[{ required: true, message: 'Please input a name!' }]}
      >
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
