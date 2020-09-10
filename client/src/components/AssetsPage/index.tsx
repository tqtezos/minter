/** @jsx jsx */
import { FC } from 'react';
import { jsx } from '@emotion/core';
import { useLocation } from 'wouter';

import Page from '../Page';
import PageTitle from '../common/PageTitle';

const CreateNonFungiblePage: FC = () => {
  const [, setLocation] = useLocation();
  
  return (
    <Page>
      <PageTitle 
        title="Assets" 
        description="Your assets on the Tezos blockchain"
        onClick={() => {setLocation('/')}}
      />
    </Page>
  );
};

export default CreateNonFungiblePage;
