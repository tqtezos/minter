/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled'
import { FC } from 'react';
import { Form, Empty } from 'antd';

const Image = styled.img({
  width: '100%'
});

const ImageContainer = styled.div({
  width: '20em',
  border: 'solid 1px #C8C8C8',
  padding: '1.5em'
})

const ImagePreview: FC<{ url?: string }> = ({ url }) => (
  <Form layout="vertical">
    <Form.Item label="Image Preview">
      <ImageContainer>
        {url ? (
          <Image src={url} alt="token" />
        ) : (
          <Empty description="Upload an Image" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        )}
      </ImageContainer>
    </Form.Item>
  </Form>
);

export default ImagePreview;

