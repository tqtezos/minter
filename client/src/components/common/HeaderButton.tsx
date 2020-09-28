/** @jsx jsx */
import { FC } from 'react';
import { Button } from 'antd';
import { jsx } from '@emotion/core';

type HeaderButtonProps = {
  title: string;
  onClick: () => void;
  loading?: boolean;
}
    
const HeaderButton: FC<HeaderButtonProps> = ({title, onClick, loading}) => (
  <Button
    size="large"
    shape="round" 
    type="primary"
    onClick={onClick}
    loading={loading}
    css={{ width: '8em'}}
  >
    {title}
  </Button>
);
  
export default HeaderButton;
