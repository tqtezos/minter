/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';

const SelectedContractTitle: FC<{ address?: string }> = ({ address}) => {
  return (
    <div>
      <span>Name</span> - <span>{address}</span>
    </div>
  );
};

export default SelectedContractTitle;
