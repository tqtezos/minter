/** @jsx jsx */
import { jsx } from '@emotion/core';
import { FC } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { UploadChangeParam } from 'antd/lib/upload';
import { RcCustomRequestOptions, RcFile } from 'antd/lib/upload/interface';
import { IpfsContent } from '../../generated/graphql_schema';

export interface ImageIpfsUploadProps {
  onChange: (info: IpfsContent) => void;
}

const onChangeHandler = async (
  info: UploadChangeParam,
  onChange: ImageIpfsUploadProps['onChange']
) => {
  if (!info.file.originFileObj) {
    return;
  }

  if (info.file.status === 'done') {
    const loadingMessage = 'Uploading image to IPFS Server...';
    const hideLoadingMessage = message.loading(loadingMessage, 0);

    const formData = new FormData();
    formData.append('file', info.file.originFileObj);

    try {
      const response = await fetch('/ipfs-upload', {
        method: 'POST',
        body: formData
      });
      const data: IpfsContent = await response.json();
      message.success('Succesfully uploaded image to IPFS Server.');
      onChange(data);
    } catch (error) {
      console.error(error);
      message.error(
        'Problems uploading image to IPFS Server! Please try later.',
        10
      );
    } finally {
      hideLoadingMessage();
    }
  }
};

const dummyRequest = ({ file, onSuccess }: RcCustomRequestOptions) => {
  setTimeout(() => {
    onSuccess({}, file);
  }, 0);
};

const validateImageType = (file: RcFile) => {
  const isImage = file.type.startsWith('image');
  if (!isImage) {
    message.error(`${file.name} is not an image file`);
  }
  return isImage;
};

const ImageIpfsUpload: FC<ImageIpfsUploadProps> = ({ onChange }) => {
  return (
    <Upload
      customRequest={dummyRequest}
      showUploadList={false}
      beforeUpload={validateImageType}
      onChange={info => onChangeHandler(info, onChange)}
    >
      <Button type="primary" shape="round" size="large" css={{ width: '12em' }}>
        <UploadOutlined /> Click to Upload
      </Button>
    </Upload>
  );
};

export default ImageIpfsUpload;
