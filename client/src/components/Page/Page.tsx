/** @jsx jsx */
import { FC } from 'react'
import { jsx } from '@emotion/core';
import { Divider } from 'antd';

import Header from './Header';

const Page: FC<{children: React.ReactNode}> = ({children}) => (
  <div css={{display: 'flex', flexFlow: 'column'}}>
    <div>
      <div css={{padding: '0.5vw 3vw'}}>
        <Header />
      </div>
      <Divider css={{margin: 0}}/>
    </div>
    <div css={{flex: 1, padding: '0.5em 3vw'}}>
      {children}
    </div>
  </div>
);

export default Page;