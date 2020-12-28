/** @jsx jsx */
import { FC, Fragment } from 'react';
import { jsx } from '@emotion/core';
import { Alert } from 'antd';
import { AttentionSeeker } from 'react-awesome-reveal';

import WalletConnector from '../WalletConnector';

interface Props {
  message: string;
  description: string;
}

const NotConnectedAlert: FC<Props> = ({ message, description }) => (
  <Fragment>
    <AttentionSeeker effect="headShake">
      <Alert
        css={{ marginTop: '3em', marginBottom: '3em', width: '50em' }}
        type="error"
        message={message}
        description={description}
        showIcon
      />
    </AttentionSeeker>
    <WalletConnector />
  </Fragment>
);

export default NotConnectedAlert;
