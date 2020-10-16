/** @jsx jsx */
import { FC, Fragment } from 'react';
import { jsx } from '@emotion/core';
import { Select, Skeleton, Form } from 'antd';
import { useContractNamesQuery } from '../CreateNonFungiblePage/useContractNamesQuery';

const { Option } = Select;

interface Props {
    onChange: (value: string) => void
}

const ContractsFilter: FC<Props> = ({ onChange }) => {
  const { data, loading } = useContractNamesQuery();

  return (
    <Form layout="vertical" wrapperCol={{ span: 9 }} css={{ marginTop: '1em'}}>
      <Form.Item label="Select Your Contract">
        {loading && <Skeleton.Input />}
        {data && (
          <Select onChange={onChange}>
            <Option key="all" value="all">
              All
            </Option>
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
