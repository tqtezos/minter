/** @jsx jsx */
import { FC, Fragment, useEffect, useState } from 'react';
import { jsx } from '@emotion/core';
import { Form, Select, message } from 'antd';
import { FormInstance } from 'antd/lib/form/hooks/useForm';

import ImagePreview from './ImagePreview';
import { IpfsContent } from '../../api/ipfsUploader';
import { useContracts, useWalletAddress } from '../App/globalContext';
import { useContractNamesQuery } from '../../hooks/useContractNamesQuery';
import NewContract from './NewContract';

const { Option } = Select;
interface Props {
  ipfsContent?: IpfsContent;
  form: FormInstance;
}

const RightSide: FC<Props> = ({ ipfsContent, form }) => {
  const contracts = useContracts();
  const ownerAddress = useWalletAddress();
  const [newContractVisible, setNewContractVisible] = useState(false);
  const { data, loading, refetch } = useContractNamesQuery(ownerAddress);

  useEffect(() => {
    if (!data) form.setFieldsValue({ contract: undefined });
    else if (data.length === 1)
      form.setFieldsValue({ contract: data[0].address });
    else {
      const contractAddress = form.getFieldValue('contract');
      if (!data.find(c => c.address === contractAddress))
        form.setFieldsValue({ contract: undefined });
    }
  }, [data, form]);

  const handleSelectContract = (value: string) => {
    if (value === 'new') setNewContractVisible(true);
  };

  const handleCancelNewContract = () => {
    form.setFieldsValue({ contract: undefined });
    setNewContractVisible(false);
  };

  const handleCreateContract = async (contractName: string) => {
    form.setFieldsValue({ contract: undefined });
    setNewContractVisible(false);
    const hideMessage = message.loading('Creating a new smart contract', 0);

    try {
      const nft = await contracts!.nft();
      const address = await nft.createContract(contractName);

      message.success(`Succesfuly created a new contract ${address}`);
      console.log(address);

      refetch();
      form.setFieldsValue({ contract: address });
    } catch (error) {
      message.error(error.message, 10); // Keep for 10 seconds
    } finally {
      hideMessage();
    }
  };

  return (
    <Fragment>
      <NewContract
        visible={newContractVisible}
        onCancel={handleCancelNewContract}
        onOk={handleCreateContract}
      />
      <Form.Item
        label="Contract"
        name="contract"
        rules={[{ required: true, message: 'Please select a contract!' }]}
      >
        <Select
          onChange={handleSelectContract}
          loading={loading}
          placeholder="Select a contract"
        >
          {data?.map(c => (
            <Option key={c.address} value={c.address}>
              {c.name} - {c.address}
            </Option>
          ))}
          <Option key="new" value="new">
            Create New Contract
          </Option>
        </Select>
      </Form.Item>
      <Form.Item label="Image Preview" css={{ marginTop: '7em' }}>
        <ImagePreview ipfsContent={ipfsContent} />
      </Form.Item>
    </Fragment>
  );
};

export default RightSide;
