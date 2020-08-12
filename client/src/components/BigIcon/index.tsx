import React, { FC } from 'react';
import styled from '@emotion/styled';
import NonFungibleToken from './nonFungibleToken.png';

const Container = styled.div({
  width: 214,
  height: 302,
  border: '1px solid #E8E8E8',
  display: 'flex',
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start'
});

const Image = styled.img({
  maxWidth: '100%',
  maxHeight: '100%',
  padding: '10px 30px',
  margin: 'auto'
});

const Title = styled.div({
  padding: '10px 30px',
  textAlign: 'center',
  fontFamily: 'sans-serif',
  fontWeight: 500,
  fontSize: '20px',
  lineHeight: '23px',
  letterSpacing: '0.15px',
  color: 'rgba(0, 0, 0, 0.87)'
});

const Description = styled.div({
  padding: '10px 30px',
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
    <Title>{title}</Title>
    <Description>{description}</Description>
  </Container>
);

export default BigIcon;

export const NonFungibleIcon: FC = () => 
  <BigIcon
    image={NonFungibleToken} 
    title="Non Fungible" 
    description="A unique asset that is one-of-a-kind" 
  />
