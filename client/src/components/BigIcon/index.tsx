/** @jsx jsx */
import { FC } from 'react';
import { jsx, Interpolation } from '@emotion/core';
import NonFungibleToken from './nonFungibleToken.png';

const imageStyle: Interpolation = {
  maxWidth: '100%',
  maxHeight: '100%',
  padding: '10px 30px'
}

const parentStyle: Interpolation = {
  width: 214,
  height: 302,
  border: '1px solid #E8E8E8',
  display: 'flex',
  flexFlow: 'column',
  alignItems: 'center',
  justifyContent: 'flex-start'
};

const titleStyle: Interpolation = {
  padding: '10px 30px',
  textAlign: 'center',
  fontFamily: 'sans-serif',
  fontWeight: 500,
  fontSize: '20px',
  lineHeight: '23px',
  letterSpacing: '0.15px',
  color: 'rgba(0, 0, 0, 0.87)'
};

const descriptionStyle: Interpolation = {
  padding: '10px 30px',
  textAlign: 'center',
  fontFamily: 'sans-serif',
  fontWeight: 'bold',
  fontSize: '14px',
  lineHeight: '20px',
  letterSpacing: '0.25px',
  color: 'rgba(0, 0, 0, 0.6)'
};

interface BigIconProps {
  image: string;
  title: string;
  description: string;
}

const BigIcon: FC<BigIconProps> = ({ image, title, description}) => (
  <div css={parentStyle}>
    <div css={{flex: 1}} />
    <img src={image} alt={title} css={imageStyle} />
    <div css={{flex: 1}} />
    <div css={titleStyle}>{title}</div>
    <div css={descriptionStyle}>{description}</div>
  </div>
);

export default BigIcon;

export const NonFungibleIcon: FC = () => 
  <BigIcon
    image={NonFungibleToken} 
    title="Non Fungible" 
    description="A unique asset that is one-of-a-kind" 
  />
