/** @jsx jsx */
import { FC, Fragment } from 'react';
import { jsx } from '@emotion/core';
import { Row, Col, Spin, Skeleton, Alert as AntdAlert } from 'antd';
import { Flip, AttentionSeeker } from 'react-awesome-reveal';

import Page from '../Page';
import { BackButtonRow } from '../common/PageTitle';
import { Name } from './Typography';
import AssetDescription from './AssetDescription';
import Actions from './Actions';
import { useNftsQuery } from '../common/useNftsQuery';
import { NonFungibleToken } from '../../generated/graphql_schema';
import { urlFromCid } from '../../api/ipfsUploader';
import { useWalletAddress } from '../App/globalContext';
import NotConnectedAlert from '../common/NotConnectedAlert';

const Image: FC<{ nft?: NonFungibleToken }> = ({ nft }) => {
  return (
    <Fragment>
      {!nft ? (
        <Skeleton.Image
          css={{
            display: 'flex',
            flex: 1,
            width: '70%',
            padding: '1em',
            border: 'solid 1px'
          }}
        />
      ) : (
        <div css={{ width: '70%', padding: '1em', border: 'solid 1px' }}>
          <Flip key={nft.extras.ipfs_cid}>
            <img
              css={{ width: '100%' }}
              src={urlFromCid(nft.extras.ipfs_cid)}
              alt=""
            />
          </Flip>
        </div>
      )}
    </Fragment>
  );
};

const AssetDetails: FC<{ nft?: NonFungibleToken }> = ({ nft }) => (
  <Row>
    <Col offset={3} span={18}>
      <Row>
        <Col offset={12} span={12}>
          {nft ? <Name>{nft.name}</Name> : <Skeleton paragraph={false} />}
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Image nft={nft} />
        </Col>
        <Col span={12}>
          <AssetDescription nft={nft} />
        </Col>
      </Row>
      <Row>
        <Col offset={12} span={12}>
          <Actions />
        </Col>
      </Row>
    </Col>
  </Row>
);

const Alert: FC<{ message: string; description: string }> = ({
  message,
  description
}) => (
  <AttentionSeeker effect="headShake">
    <AntdAlert
      css={{ marginTop: '3em', marginBottom: '3em', width: '50em' }}
      type="error"
      message={message}
      description={description}
      showIcon
    />
  </AttentionSeeker>
);
interface Props {
  contractAddress: string;
  tokenId: number;
}

export const PageBody: FC<Props> = ({ contractAddress, tokenId }) => {
  const walletAddress = useWalletAddress();
  const { data, error, loading } = useNftsQuery(contractAddress);
  const nft = data?.nfts.find(t => t.tokenId === tokenId);

  if (!walletAddress)
    return (
      <NotConnectedAlert
        message="Cannot show asset details!"
        description="To see your asset details please connect to your wallet first."
      />
    );

  if (error)
    return <Alert message="GraphQL Error!" description={error.toString()} />;

  if (data && !nft)
    return (
      <Alert
        message="GraphQL Error!"
        description={`Cannot find token ${tokenId} in contract ${contractAddress}`}
      />
    );

  return (
    <Spin spinning={loading} size="large">
      <AssetDetails nft={nft} />
    </Spin>
  );
};

const AssetDetailsPage: FC<Props> = ({ contractAddress, tokenId }) => (
  <Page>
    <BackButtonRow onClick={() => window.history.back()} />
    <PageBody contractAddress={contractAddress} tokenId={tokenId} />
  </Page>
);

export default AssetDetailsPage;
