/** @jsx jsx */
import { FC, Fragment } from 'react';

import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import { Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons'

const Title = styled.div({
  fontFamily: 'sans-serif',
  fontSize: '60px',
  lineHeight: '60px',
  letterSpacing: '0.75px',
});
  
const Text = styled.span({
  fontFamily: 'sans-serif',
  fontWeight: 300,
  fontSize: '20px',
  lineHeight: '30px',
  letterSpacing: '0.75px',
  color: 'black'
});

interface PageTitleProps {
  title: string;
  description: string;
  onClick?: () =>  void;
}
  
const PageTitle: FC<PageTitleProps> = ({ title, description, onClick}) => (
  <Fragment>
    <Row 
      align="middle" 
      justify="start" 
    >
      <Col>
        <Text 
          onClick={onClick}      
          css={{ 
            cursor: 'pointer',
            visibility: onClick ? 'visible' : 'hidden'
          }} 
        >
          <ArrowLeftOutlined />&nbsp;Back
        </Text>
      </Col>
    </Row>
    <Row css={{paddingTop: '1em'}}>
      <Col><Title>{title}</Title></Col>
    </Row>
    <Row css={{paddingTop: '1em'}}>
      <Col><Text>{description}</Text></Col>
    </Row>
  </Fragment>
);

export default PageTitle;
