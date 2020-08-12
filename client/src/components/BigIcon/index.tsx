import React, { FC } from 'react';
import styled from '@emotion/styled';
import NonFungibleToken from './nonFungibleToken.png';
import { Space } from 'antd';

const Container = styled.div({
  width: 214,
  height: 302,
  border: '1px solid #E8E8E8',
  padding: '1.5em',
  display: 'flex',
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'flex-end'
});

const Image = styled.img({
  maxWidth: '100%',
  maxHeight: '100%',
  margin: 'auto'
});

const Title = styled.div({
  textAlign: 'center',
  fontFamily: 'sans-serif',
  fontWeight: 500,
  fontSize: '20px',
  lineHeight: '23px',
  letterSpacing: '0.15px',
  color: 'rgba(0, 0, 0, 0.87)'
});

const Description = styled.div({
  textAlign: 'center',
  fontFamily: 'sans-serif',
  fontWeight: 'bold',
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: '0.25px',
  color: 'rgba(0, 0, 0, 0.6)'
});

interface BigIconProps {
  image: string;
  title: string;
  description: string;
}

const BigIcon: FC<BigIconProps> = ({ image, title, description}) => (
  <Container>
    <Image src={image} alt={title} />
    <Space direction="vertical" size="middle">
      <Title>{title}</Title>
      <Description>{description}</Description>
    </Space>
  </Container>
);

export default BigIcon;

export const NonFungibleIcon: FC = () => 
  <BigIcon
    image={NonFungibleToken} 
    title="Non Fungible" 
    description="A unique asset that is one-of-a-kind" 
  />
