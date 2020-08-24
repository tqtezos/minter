/** @jsx jsx */
import { FC, Fragment } from 'react';
import { Button, Row, Col, Space } from 'antd';
import { jsx } from '@emotion/core';
import { useLocation } from 'wouter';

import LogoImage from './logo.svg';

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

type HeaderButtonProps = {
  title: string;
  onClick: () => void;
}

const HeaderButton: FC<HeaderButtonProps> = ({title, onClick}) => (
  <Button
    size="large"
    shape="round" 
    type="primary"
    onClick={onClick}
    css={{ width: '7em'}}
  >
    {title}
  </Button>
);


const Header: FC = () => {
  const [, setLocation] = useLocation();

  return (
    <Fragment>
      <Row align="middle">
        <Col><Logo onClick={() => {setLocation('/')}} /></Col>
        <Col flex="1" />
        <Col>
          <Space size="middle">
            <HeaderButton title="Create" onClick={() => {}} />
            <HeaderButton title="Connect" onClick={() => {}} />
          </Space>
        </Col>
      </Row>
    </Fragment>
  );
};

export default Header;
