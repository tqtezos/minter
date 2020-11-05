/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { Select, Skeleton, Form } from 'antd';

import { useContractNamesQuery } from '../common/useContractNamesQuery';
import { useWalletAddress } from '../App/globalContext';
import { ContractInfo } from '../../generated/graphql_schema';

const { Option } = Select;

interface Props {
  address?: string;
  onChange: (address?: ContractInfo) => void;
}

const ContractsFilter: FC<Props> = ({ address, onChange }) => {
  const walletAddress = useWalletAddress();
  const { data, loading } = useContractNamesQuery(undefined, walletAddress);

  const handleOnChange = (address: string) => {
    if (address === 'all') return onChange(undefined);
    onChange(data?.contractNames.find(c => c.address === address));
  };

  const selectedAddress = (c: ContractInfo[]) =>
    address ? address : c.length === 1 ? c[0].address : 'all';

  return (
    <Form layout="vertical" wrapperCol={{ span: 9 }} css={{ marginTop: '1em' }}>
      <Form.Item label="Select Your Contract">
        {loading && <Skeleton.Input />}
        {data && (
          <Select
            value={selectedAddress(data.contractNames)}
            onChange={handleOnChange}
          >
            {data.contractNames.length > 1 && (
              <Option key="all" value="all">
                All
              </Option>
            )}
            {data.contractNames.map(c => (
              <Option key={c.address} value={c.address}>
                {c.name} - {c.address}
              </Option>
            ))}
          </Select>
        )}
      </Form.Item>
    </Form>
  );
};

export default ContractsFilter;
