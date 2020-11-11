/** @jsx jsx */
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { FC } from 'react';
import { Empty } from 'antd';
import { IpfsContent } from '../../api/ipfsUploader';
import { Flip } from 'react-awesome-reveal';

const Image = styled.img({
  height: '15em',
  maxWidth: '30em'
});

const ImageContainer = styled.div({
  height: 'min-content',
  width: 'min-content',
  border: 'solid 1px #C8C8C8',
  padding: '1.5em'
});

const ImagePreview: FC<{ ipfsContent?: IpfsContent }> = ({ ipfsContent }) => (
  <Flip key={ipfsContent?.cid} direction="horizontal">
    <ImageContainer>
      {ipfsContent ? (
        <a
          href={ipfsContent.publicGatewayUrl}
          title="Click to download this image from the IPFS Public Gateway"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image src={ipfsContent.url} alt="token" />
        </a>
      ) : (
        <Empty
          css={{ width: '17em' }}
          description="Upload an Image"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      )}
    </ImageContainer>
  </Flip>
);

export default ImagePreview;
