/** @jsx jsx */
import { FC, useEffect } from 'react';
import { jsx } from '@emotion/core';
import { Select, Skeleton, Form } from 'antd';

import { ContractInfo } from '../../generated/graphql_schema';
import { useContractNamesQuery } from '../common/useContractNamesQuery';
import { useWalletAddress } from '../App/globalContext';

const { Option } = Select;

interface Props {
  contract?: ContractInfo;
  onChange: (contract?: ContractInfo) => void;
}

const ContractsFilter: FC<Props> = ({ contract, onChange }) => {
  const walletAddress = useWalletAddress();
  const { data, loading } = useContractNamesQuery(undefined, walletAddress);
  const contracts = data?.contractNames;

  const selectedValue = (contract?: ContractInfo) =>
    contract ? contract.address : 'all';

  const handleOnChange = (address: string) => {
    if (address === 'all') onChange(undefined);
    else onChange(contracts?.find(c => c.address === address));
  };

  useEffect(() => {
    if (contracts && contracts.length === 1) {
      onChange(contracts[0]);
      return;
    }
  }, [contracts, onChange]);

  return (
    <Form layout="vertical" wrapperCol={{ span: 9 }} css={{ marginTop: '1em' }}>
      <Form.Item label="Select Your Contract">
        {loading && <Skeleton.Input />}
        {contracts && (
          <Select value={selectedValue(contract)} onChange={handleOnChange}>
            {contracts.length > 1 && (
              <Option key="all" value="all">
                All
              </Option>
            )}
            {contracts.map(c => (
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
