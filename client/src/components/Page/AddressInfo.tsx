/** @jsx jsx */
import { FC, Fragment, useEffect, useState, useRef } from 'react';
import { jsx } from '@emotion/core';
import { Row, Col } from 'antd';
import BigNumber from 'bignumber.js';
import { useTzToolkit } from '../App/globalContext';

const Label: FC<{ label: string }> = ({ label }) => 
  <Col span={6} css={{textAlign: "right", fontWeight: 450}}>
    {label}: 
  </Col>

const Value: FC<{ value: string }> = ({ value }) => 
  <Col span={18} css={{fontWeight: 350}}>
    {value}
  </Col>

const formatBalance = (balance: BigNumber) => 
  `${balance.div(1000000).decimalPlaces(4)} ꜩ`;

const AddressInfo: FC = () => {
  const tzToolkit = useTzToolkit();
  const [address, setAddress] = useState<string>();
  const [balance, setBalance] = useState<BigNumber>();
  const timeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (tzToolkit)
      tzToolkit.wallet.pkh().then(setAddress);
    else
      setAddress(undefined);
  }, 
  [tzToolkit]);
  
  useEffect(() => {
    if (tzToolkit && address) {
      const refreshBalance = () => 
        tzToolkit.tz.getBalance(address)
        .then(setBalance);
      
      refreshBalance();
      timeout.current = setInterval(refreshBalance, 10000); // 10 seconds
    } else {
      setBalance(undefined);
      if(timeout.current) clearInterval(timeout.current);
    }
    return () => {
      if (timeout.current) clearInterval(timeout.current);
    }
  }, 
  [address, tzToolkit]);  

  if (!address || !balance)
    return <Fragment />;

  return (
    <Fragment>
      <Row gutter={10}>
        <Label label="Account" />
        <Value value={address} />
      </Row>
      <Row gutter={10}>
        <Label label="Balance" />
        <Value value={formatBalance(balance)} />
      </Row>
    </Fragment>
  );
}

export default AddressInfo;
