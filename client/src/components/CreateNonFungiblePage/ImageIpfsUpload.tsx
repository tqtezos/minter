/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { RcCustomRequestOptions } from 'antd/lib/upload/interface';

const IpfsClient = require('ipfs-http-client');
const ipfsClient = IpfsClient('http://localhost:5001');

const dummyRequest = ({ file, onSuccess }: RcCustomRequestOptions) => {
  setTimeout(() => {
    onSuccess({}, file);
  }, 0);
};

interface IpfsUpload {
  url: string;
}

export interface ImageIpfsUploadProps {
  onChange: (info: IpfsUpload) => void
}
  
const ImageIpfsUpload: FC<ImageIpfsUploadProps> = ({ onChange }) => {
  const onChangeHandler = (info: UploadChangeParam) => {
    if (info.file.status === 'done') {
      const reader = new FileReader();
      
      reader.addEventListener('load', async () => { 
        const ipfsFile = await ipfsClient.add(reader.result);
        const url = `http://localhost:8080/ipfs/${ipfsFile.path}`
        onChange({url}) 
      });
      
      reader.readAsArrayBuffer(info.file.originFileObj as Blob);    
    }    
  }

  return (
    <Upload
      customRequest={dummyRequest}
      showUploadList={false}
      onChange={onChangeHandler}
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
}

export default ImageIpfsUpload;
