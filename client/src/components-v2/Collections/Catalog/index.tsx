import React, { Dispatch } from 'react';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { RefreshCw } from 'react-feather';
import { MinterButton } from '../../common';
import Sidebar from './Sidebar';
import TokenGrid from './TokenGrid';
import { State, Action } from '../reducer';

interface CatalogProps {
  state: State;
  dispatch: Dispatch<Action>;
}

export default function Catalog({ state, dispatch }: CatalogProps) {
  return (
    <Flex flex="1" w="100%" minHeight="0">
      <Flex w="250px" h="100%" flexDir="column">
        <Sidebar state={state} dispatch={dispatch} />
      </Flex>
      <Flex
        flexDir="column"
        h="100%"
        w="100%"
        px={10}
        pt={6}
        flex="1"
        bg="brand.brightGray"
        borderLeftWidth="1px"
        borderLeftColor="brand.lightBlue"
        overflowY="scroll"
        justify="start"
      >
        <Flex w="100%" pb={6} justify="space-between" align="center">
          <Heading size="lg">
            {
              state.collections.find(
                ({ address }) => address === state.selectedCollection
              )?.name
            }
          </Heading>
          <MinterButton variant="primaryActionInverted">
            <Box color="currentcolor">
              <RefreshCw size={16} strokeWidth="3" />
            </Box>
            <Text ml={2}>Refresh</Text>
          </MinterButton>
        </Flex>
        <TokenGrid state={state} />
      </Flex>
    </Flex>
  );
}
