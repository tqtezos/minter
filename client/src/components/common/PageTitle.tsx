/** @jsx jsx */
import { FC, Fragment } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

const Title = styled.h1({
  fontFamily: 'sans-serif',
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

interface PageTitleProps {
  title: string;
  description: string;
}
  
const PageTitle: FC<PageTitleProps> = ({ title, description}) => (
  <Fragment>
    <Title>{title}</Title>
    <Description>{description}</Description>
  </Fragment>
);

export default PageTitle;