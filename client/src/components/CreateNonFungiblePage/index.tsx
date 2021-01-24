import React, { useContext, useEffect, useReducer } from 'react';
import { useLocation } from 'wouter';
import { Box, Flex, Text } from '@chakra-ui/react';
import { SystemContext } from '../../context/system';
import { MinterButton } from '../common';
import { reducer, steps, initialState, DispatchFn, State } from './reducer';
import Form from './Form';
import FileUpload from './FileUpload';
import CollectionSelect from './CollectionSelect';
import Preview from './Preview';
import { ChevronLeft, X } from 'react-feather';
import { mintToken } from '../../lib/nfts/actions';

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
              borderRadius="3px"
              height="5px"
              mx={1}
              flex="1"
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

export default function CreateNonFungiblePage() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [, setLocation] = useLocation();
  const { system } = useContext(SystemContext);
  useEffect(() => {
    if (system.status !== 'WalletConnected') {
      setLocation('/');
    }
  });

  return (
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
          <Flex flex="1">
            <MinterButton
              variant="cancelAction"
              onClick={() => setLocation('/assets')}
              display="flex"
              alignItems="center"
              color="brand.red"
              border="none"
              _hover={{
                color: 'white',
                textDecoration: 'underline',
                borderColor: 'brand.red'
              }}
            >
              <Box color="currentcolor">
                <X size={16} strokeWidth="3" />
              </Box>
              <Text fontSize={16} ml={1} fontWeight="600">
                Cancel
              </Text>
            </MinterButton>
          </Flex>
          <ProgressIndicator state={state} />
          <Flex flex="1" justify="end">
            <MinterButton
              visibility={state.step !== 'file_upload' ? 'visible' : 'hidden'}
              variant="primaryActionInverted"
              onClick={() => dispatch({ type: 'decrement_step' })}
            >
              <Box color="currentcolor">
                <ChevronLeft size={16} strokeWidth="3" />
              </Box>
              <Text ml={2}>Back</Text>
            </MinterButton>
            <MinterButton
              variant="primaryAction"
              onClick={() => {
                if (state.step === 'collection_select') {
                  if (
                    system.status === 'WalletConnected' &&
                    state.collectionAddress !== null &&
                    state.fields.name !== null
                  ) {
                    const metadata: Record<string, string> = {};

                    metadata.name = state.fields.name;
                    if (state.fields.description) {
                      metadata.description = state.fields.description;
                    }

                    for (let row of state.metadataRows) {
                      if (row.name !== null && row.value !== null) {
                        metadata[row.name] = row.value;
                      }
                    }

                    mintToken(system, state.collectionAddress, metadata).then(
                      () => {
                        setLocation('/assets');
                      }
                    );
                  }
                } else {
                  dispatch({ type: 'increment_step' });
                }
              }}
              ml={4}
            >
              {state.step === 'collection_select' ? 'Create' : 'Next'}
            </MinterButton>
          </Flex>
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
      {state.step === 'file_upload' && !state.fields.ipfs_hash ? (
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
          overflowY="scroll"
          px={28}
          pt={16}
        >
          <Preview state={state} />
        </Flex>
      )}
    </Flex>
  );
}
