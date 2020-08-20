/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { RcCustomRequestOptions } from 'antd/lib/upload/interface';

const dummyRequest = ({ file, onSuccess }: RcCustomRequestOptions) => {
  setTimeout(() => {
    onSuccess({}, file);
  }, 0);
};

export interface UploadImageProps {
  onChange: (hander: UploadChangeParam) => void
}
  
const UploadImage: FC<UploadImageProps> = ({ onChange }) => (
  <Upload
    customRequest={dummyRequest}
    showUploadList={false}
    onChange={onChange}
  >
    <Button 
      type="primary" 
      shape="round"
      size="large"
      css={{width: '12em'}}
    >
      <UploadOutlined /> Click to Upload
    </Button>
  </Upload>    
);

export default UploadImage;
