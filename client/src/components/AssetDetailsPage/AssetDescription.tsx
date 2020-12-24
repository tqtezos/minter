/** @jsx jsx */
import { FC, Fragment } from 'react';
import { jsx } from '@emotion/core';

import { Description, ParamName, ParamValue } from './Typography';
import { NonFungibleToken } from '../../generated/graphql_schema';
import { Skeleton } from 'antd';

const AssetDescription: FC<{ nft?: NonFungibleToken }> = ({ nft }) => (
  <Fragment>
    {nft ? <Description>{nft.extras.description}</Description> : <Skeleton />}

    <div>
      <ParamName>Type: </ParamName>
      <ParamValue>Digital Art</ParamValue>
    </div>

    <div>
      <ParamName>Collection: </ParamName>
      {nft ? <ParamValue>{nft.contractInfo.name}</ParamValue> : <Skeleton />}
    </div>

    <div>
      <ParamName>Owner: </ParamName>
      {nft ? <ParamValue>{nft.owner}</ParamValue> : <Skeleton />}
    </div>

    <div css={{ marginTop: '4em' }}>
      <ParamName>History: </ParamName>
    </div>
  </Fragment>
);

export default AssetDescription;
