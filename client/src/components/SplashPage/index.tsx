/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { Row, Col, Button } from 'antd';

import Page from '../Page';
import Splash from './splash.png'

const Title = styled.h1({
  fontFamily: 'sans-serif',
  fontWeight: 300,
  fontSize: '60px',
  lineHeight: '60px',
  letterSpacing: '0.75px',
});

const Description = styled.p({
  fontFamily: 'sans-serif',
  fontWeight: 300,
  fontSize: '20px',
  lineHeight: '30px',
  letterSpacing: '0.75px',
  color: 'black'
});

const MintTokensButton: FC<{ onClick: () => void }> = ({ onClick }) => (
  <Button
    size="large"
    shape="round" 
    type="primary"
    onClick={onClick}
    css={{
      width: '12em',
      height: '2.5em !important',
      fontSize: '1.5em !important'
    }}
  >
    Mint Tokens
  </Button>
);

const SplashImage: FC = () => (
  <img
    src={Splash} 
    alt="Splash"
    css={{maxWidth: '100%', maxHeight: '100%'}}
  />
);

const SplashPage: FC = () => (
  <Page>
    <Row>
      <Col span={10}>
        <Title>Mint token on Tezos <br /> with the click of a button</Title>
        <Description>
          Create any kind asset: fungible, non-fungible or a basket by
          using our simple interface. Just connect your Tezos account.
        </Description>
        <MintTokensButton onClick={() => {}} />
        <Description css={{marginTop: '7em'}}>
          Learn more about TZIP-12
          <a href="https://gitlab.com/tzip/tzip/-/blob/master/proposals/tzip-12/tzip-12.md"> here</a>
        </Description>
      </Col>
      <Col span={14}>
        <SplashImage />
      </Col>
    </Row>
  </Page>
);

export default SplashPage;
