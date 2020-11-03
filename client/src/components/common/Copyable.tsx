import React, { Fragment } from 'react';
import { Typography } from 'antd';

export default ({ text }: { text?: string }) => (
  <Fragment>{text && <Typography.Text copyable={{ text }} />}</Fragment>
);
