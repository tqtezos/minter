/** @jsx jsx */
import { FC, Fragment } from 'react';
import { Row, Col, Space } from 'antd';
import { jsx } from '@emotion/core';
import { useLocation } from 'wouter';

import LogoImage from './logo.svg';
import HeaderButton from '../common/HeaderButton';
import WalletConnector from '../WalletConnector';
import AddressInfo from './AddressInfo';

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

const Header: FC = () => {
  const [, setLocation] = useLocation();

  return (
    <Fragment>
      <Row align="middle">
        <Col><Logo onClick={() => { setLocation('/') }} /></Col>
        <Col><AddressInfo /></Col>
        <Col flex="1" />
        <Col>
          <Space size="middle">
            <HeaderButton title="Create" onClick={() => { setLocation('/create-non-fungible') }} />
            <HeaderButton title="Assets" onClick={() => { setLocation('/assets') }} />
            <WalletConnector  />
          </Space>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Header;
