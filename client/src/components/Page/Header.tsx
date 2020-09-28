/** @jsx jsx */
import { FC, Fragment, useEffect, useState } from 'react';
import { Row, Col, Space } from 'antd';
import { jsx } from '@emotion/core';
import { useLocation } from 'wouter';
import { TezosToolkit } from '@taquito/taquito';
import BigNumber from 'bignumber.js';

import LogoImage from './logo.svg';
import HeaderButton from '../common/HeaderButton';
import WalletConnector from '../WalletConnector';

const Logo: FC<{ onClick: () => void}> = ({onClick}) => (
  <img
    src={LogoImage} 
    alt="Logo"
    onClick={onClick}
    css={{
      height: '4em',
      cursor: 'pointer'
    }}
  />
);

interface AccountInfo {
  account: string;
  balance: BigNumber;
}

const Header: FC = () => {
  const [, setLocation] = useLocation();
  const [tzClient, setTzClient] = useState<TezosToolkit>();
  const [accountInfo, setAccountInfo] = useState<AccountInfo>();
   
  useEffect(() => {
    const getAaccountInfo = async () => {
      if(tzClient) {
        const account = await tzClient.wallet.pkh();
        const balance = await tzClient.tz.getBalance(account);
        setAccountInfo({ account, balance });
      } else {
        setAccountInfo(undefined);
      }
    }

    getAaccountInfo()  
  }, [tzClient]);

  return (
    <Fragment>
      <Row align="middle">
        <Col><Logo onClick={() => { setLocation('/') }} /></Col>
        <Col> 
          { accountInfo &&
            <div>
              <div>{accountInfo.account}</div>
              <div>{accountInfo.balance.toString()}</div>
            </div>
          }
        </Col>
        <Col flex="1" />
        <Col>
          <Space size="middle">
            <HeaderButton title="Create" onClick={() => { setLocation('/create-non-fungible') }} />
            <HeaderButton title="Assets" onClick={() => { setLocation('/assets') }} />
            <WalletConnector tzClient={tzClient} onChange={setTzClient} />
          </Space>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Header;
