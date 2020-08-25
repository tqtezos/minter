/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { RcCustomRequestOptions } from 'antd/lib/upload/interface';
import IpfsClient from 'ipfs-http-client';

const ipfsClient = IpfsClient('http://localhost:5001');

/**
 * Promisified version of FileReader.readAsArrayBuffer 
 */
const readBlobAsArrayBuffer = (blob: Blob): Promise<ArrayBuffer> => (
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => { resolve(reader.result as ArrayBuffer); };
    reader.onerror = () => { reject(reader.error); reader.abort(); };

    reader.readAsArrayBuffer(blob);
  })
)

interface IpfsUpload {
  url: string;
}

export interface ImageIpfsUploadProps {
  onChange: (info: IpfsUpload) => void
}
  
const ImageIpfsUpload: FC<ImageIpfsUploadProps> = ({ onChange }) => {
  const onChangeHandler = async (info: UploadChangeParam) => {
    if (info.file.status === 'done') {
      const buffer = await readBlobAsArrayBuffer(info.file.originFileObj as Blob);
      const ipfsFile = await ipfsClient.add(buffer);
      const url = `http://localhost:8080/ipfs/${ipfsFile.path}`
      onChange({url}) 
    }    
  }
  
  const dummyRequest = ({ file, onSuccess }: RcCustomRequestOptions) => {
    setTimeout(() => {
      onSuccess({}, file);
    }, 0);
  };
  
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
