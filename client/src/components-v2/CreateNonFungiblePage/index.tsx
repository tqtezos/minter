import React, { useReducer } from 'react';
import { useLocation } from 'wouter';
import { Flex } from '@chakra-ui/react';
import { Header, MinterButton } from '../common';
import Form from './Form';
import Preview from './Preview';
import { reducer, initialState } from './reducer';

export default function () {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [, setLocation] = useLocation();
  return (
    <Flex pos="absolute" w="100%" h="100%">
      <Flex justifyContent="space-between" width="100%" flexDir="column">
        <Header
          action={
            <MinterButton
              variant="cancelAction"
              onClick={() => setLocation('/')}
            >
              Cancel
            </MinterButton>
          }
        />
        <Flex flex="1" width="100%">
          <Flex width="50%" flexDir="column" px={28} pt={16}>
            <Form state={state} dispatch={dispatch} />
          </Flex>
          <Flex
            bg="brand.brightGray"
            borderLeftWidth="1px"
            borderLeftColor="brand.lightBlue"
            w="50%"
            flexDir="column"
            align="center"
            px={28}
            pt={16}
          >
            <Preview state={state} />
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
