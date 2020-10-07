/** @jsx jsx */
import { FC } from 'react';
import { Button } from 'antd';
import { jsx } from '@emotion/core';

type HeaderButtonProps = {
  title: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
}
    
const HeaderButton: FC<HeaderButtonProps> = ({title, onClick, loading, disabled}) => (
  <Button
    size="large"
    shape="round" 
    type="primary"
    onClick={onClick}
    loading={loading}
    disabled={disabled}
    css={{ width: '8em'}}
  >
    {title}
  </Button>
);
  
export default HeaderButton;
