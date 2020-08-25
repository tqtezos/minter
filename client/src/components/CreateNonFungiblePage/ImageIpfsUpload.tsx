/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { RcCustomRequestOptions, RcFile } from 'antd/lib/upload/interface';
import uploadToIpfs from '../../api/ipfsUploader';

interface IpfsUpload {
  url: string;
}

export interface ImageIpfsUploadProps {
  onChange: (info: IpfsUpload) => void
}
  
const ImageIpfsUpload: FC<ImageIpfsUploadProps> = ({ onChange }) => {
  const onChangeHandler = async (info: UploadChangeParam) => {
    if (info.file.status === 'done') {
      const hideLoadingMessage = message.loading('Uploading image to the IPFS Server...', 0);;
      
      try {
        const content = await uploadToIpfs(info.file.originFileObj as Blob);
        message.success('Succesfully uploaded image to IPFS Server.')
        onChange({url: content.url}) 
      } catch (error) {
        message.error(`Problems uploading image to IPFS Server! Please try later.`, 10);
        console.error(`Problem uploading to IPFS: ${error.toString()}`)
      } finally {
        hideLoadingMessage();
      }
    }    
  }

  const dummyRequest = ({ file, onSuccess }: RcCustomRequestOptions) => {
    setTimeout(() => {
      onSuccess({}, file);
    }, 0);
  };
  
  const validateImageType = (file: RcFile) => {
    const isImage = file.type.startsWith('image')
        
    if (!isImage) {
      message.error(`${file.name} is not an image file`);
    }
    
    return isImage;
  }

  return (
    <Upload
      customRequest={dummyRequest}
      showUploadList={false}
      beforeUpload={validateImageType}
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
