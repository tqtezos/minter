/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { Select, Skeleton, Form } from 'antd';

import { useContractNamesQuery } from '../common/useContractNamesQuery';
import { ContractInfo } from '../../generated/graphql_schema';

const { Option } = Select;

interface Props {
  address?: string;
  onChange: (address?: ContractInfo) => void;
}

const ContractsFilter: FC<Props> = ({ address, onChange }) => {
  const { data, loading } = useContractNamesQuery();

  const handleOnChange = (address: string) => {
    if (address === 'all') return onChange(undefined);
    onChange(data?.contractNamesByOwner.find(c => c.address === address));
  };

  return (
    <Form layout="vertical" wrapperCol={{ span: 9 }} css={{ marginTop: '1em' }}>
      <Form.Item label="Select Your Contract">
        {loading && <Skeleton.Input />}
        {data && (
          <Select value={address || 'all'} onChange={handleOnChange}>
            {data.contractNamesByOwner.length > 1 && (
              <Option key="all" value="all">
                All
              </Option>
            )}
            {data.contractNamesByOwner.map(c => (
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
