/** @jsx jsx */
import { FC, Fragment } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';
import { ContractInfo } from '../../generated/graphql_schema';

const SubTitle = styled.span({
  textAlign: 'center',
  fontFamily: 'sans-serif',
  fontWeight: 500,
  fontSize: '35px',
  lineHeight: '30px',
  letterSpacing: '0.75px',
  color: 'rgba(0, 0, 0, 0.87)'
});

const SelectedContractTitle: FC<{ contract?: ContractInfo }> = ({
  contract
}) => {
  return (
    <Fragment>
      {contract ? (
        <span>
          <SubTitle>{contract.name}</SubTitle>
          &nbsp; &nbsp;
          <span>{contract.address}</span>
        </span>
      ) : (
        <SubTitle>All Assets</SubTitle>
      )}
    </Fragment>
  );
};

export default SelectedContractTitle;
