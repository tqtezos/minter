/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { Space, Button } from 'antd';

import { ParamName } from './Typography';

const Actions: FC = () => (
  <Space size="middle" direction="vertical">
    <div>
      <ParamName>STATUS: </ParamName>
      <ParamName css={{ fontWeight: 'bold', color: 'red' }}>
        NOT FOR SALE
      </ParamName>
    </div>

    <Button type="primary" shape="round" size="large" css={{ width: '10em' }}>
      List For Sale
    </Button>
  </Space>
);

export default Actions;
