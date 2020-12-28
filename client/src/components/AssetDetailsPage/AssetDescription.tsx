/** @jsx jsx */
import { FC, Fragment } from 'react';
import { jsx } from '@emotion/core';

import { Description, ParamName, ParamValue } from './Typography';
import { NonFungibleToken } from '../../generated/graphql_schema';
import { Skeleton } from 'antd';

const AssetDescription: FC<{ nft?: NonFungibleToken }> = ({ nft }) => (
  <Fragment>
    {!nft ? (
      <Skeleton title={false} paragraph={{ rows: 3 }} />
    ) : (
      <Fragment>
        <Description>{nft.extras.description}</Description>

        <div>
          <ParamName>Type: </ParamName>
          <ParamValue>Digital Art</ParamValue>
        </div>

        <div>
          <ParamName>Collection: </ParamName>
          <ParamValue>{nft.contractInfo.name}</ParamValue>
        </div>

        <div>
          <ParamName>Owner: </ParamName>
          <ParamValue>{nft.owner}</ParamValue>
        </div>

        <div css={{ marginTop: '4em' }}>
          <ParamName>History: </ParamName>
        </div>
      </Fragment>
    )}
  </Fragment>
);

export default AssetDescription;
