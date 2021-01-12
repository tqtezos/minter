import React, { useReducer } from 'react';
import { useLocation } from 'wouter';
import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import { Header, MinterButton } from '../common';
import { reducer, steps, initialState, DispatchFn, State } from './reducer';
import Form from './Form';
import FileUpload from './FileUpload';
import CollectionSelect from './CollectionSelect';
import Preview from './Preview';

function ProgressIndicator({ state }: { state: State }) {
  const stepIdx = steps.indexOf(state.step);
  return (
    <Flex align="center" flexDir="column" flex="1">
      <Flex width="200px" justifyContent="stretch" pb={2}>
        {steps.map((step, i) => {
          const color = stepIdx >= i ? 'brand.blue' : 'brand.lightBlue';
          return (
            <Box
              key={step}
              bg={color}
              flex="1"
              borderRadius="3px"
              height="5px"
              mx={1}
            />
          );
        })}
      </Flex>
      <Text fontSize="xs" color="brand.gray">
        STEP {stepIdx + 1} OF {steps.length}
      </Text>
    </Flex>
  );
}

function LeftContent(props: { state: State; dispatch: DispatchFn }) {
  if (props.state.step === 'file_upload') {
    return <FileUpload state={props.state} dispatch={props.dispatch} />;
  }
  if (props.state.step === 'asset_details') {
    return <Form state={props.state} dispatch={props.dispatch} />;
  }
  if (props.state.step === 'collection_select') {
    return <CollectionSelect state={props.state} dispatch={props.dispatch} />;
  }
  // TypeScript not checking this properly? The above cases are exhaustive...
  return null;
}

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
        <Flex flex="1" width="100%" minHeight="0">
          <Flex w="50%" h="100%" flexDir="column" overflowY="scroll">
            <Flex
              w="100%"
              px={8}
              py={4}
              justify="space-between"
              align="end"
              borderBottomWidth="1px"
              borderBottomColor="brand.brightGray"
            >
              <MinterButton
                variant="primaryActionLined"
                onClick={() => dispatch({ type: 'decrement_step' })}
              >
                Back
              </MinterButton>
              <ProgressIndicator state={state} />
              <MinterButton
                variant="primaryAction"
                onClick={() => dispatch({ type: 'increment_step' })}
              >
                {state.step === 'collection_select' ? 'Create' : 'Next'}
              </MinterButton>
            </Flex>
            <Box
              width="100%"
              pt={10}
              px={28}
              overflowY="scroll"
              minHeight="0px"
              flex="1"
            >
              <LeftContent state={state} dispatch={dispatch} />
              <Box pb={10} w="100%" />
            </Box>
          </Flex>
          {state.step === 'file_upload' ? (
            <Flex
              bg="brand.darkGray"
              borderLeftWidth="1px"
              borderLeftColor="brand.lightBlue"
              w="50%"
              h="100%"
              flexDir="column"
              align="center"
              justify="center"
            >
              <Text color="brand.lightGray">(Artwork TBD)</Text>
            </Flex>
          ) : (
            <Flex
              bg="brand.brightGray"
              borderLeftWidth="1px"
              borderLeftColor="brand.lightBlue"
              w="50%"
              h="100%"
              flexDir="column"
              align="center"
              px={28}
              pt={16}
            >
              <Preview state={state} />
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
}
