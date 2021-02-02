import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Box, Flex, Text, useDisclosure } from '@chakra-ui/react';
import Joi from 'joi';
import { MinterButton } from '../common';
import Form from './Form';
import FileUpload from './FileUpload';
import CollectionSelect from './CollectionSelect';
import Preview from './Preview';
import StatusModal from './StatusModal';
import { ChevronLeft, X } from 'react-feather';

import { useSelector, useDispatch } from '../../reducer';
import {
  CreateNftState,
  decrementStep,
  incrementStep,
  steps
} from '../../reducer/slices/createNft';
import { mintTokenAction } from '../../reducer/async/actions';
import * as validators from '../../reducer/validators';
import { setStatus } from '../../reducer/slices/status';

function ProgressIndicator({ state }: { state: CreateNftState }) {
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

function LeftContent() {
  const step = useSelector(s => s.createNft.step);
  switch (step) {
    case 'file_upload':
      return <FileUpload />;
    case 'asset_details':
      return <Form />;
    case 'collection_select':
      return <CollectionSelect />;
    default:
      return null;
  }
}

function isValid(schema: Joi.ObjectSchema, state: CreateNftState) {
  if (schema.validate(state, { allowUnknown: true }).error) {
    return false;
  }
  return true;
}

function stepIsValid(state: CreateNftState) {
  if (
    state.step === 'file_upload' &&
    isValid(validators.fileUploadSchema, state)
  ) {
    return true;
  }
  if (
    state.step === 'asset_details' &&
    isValid(validators.assetDetailsSchema, state)
  ) {
    return true;
  }
  if (
    state.step === 'collection_select' &&
    isValid(validators.collectionSelectSchema, state)
  ) {
    return true;
  }
}

export default function CreateNonFungiblePage() {
  const { system, createNft: state } = useSelector(s => s);
  const status = useSelector(s => s.status.mintToken);
  const dispatch = useDispatch();
  const [, setLocation] = useLocation();
  const { isOpen, onClose, onOpen } = useDisclosure();
  useEffect(() => {
    if (system.status !== 'WalletConnected') {
      setLocation('/');
    }
  });

  const valid = stepIsValid(state);

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
              onClick={() => setLocation('/collections')}
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
          <Flex flex="1" justify="flex-end">
            <MinterButton
              visibility={state.step !== 'file_upload' ? 'visible' : 'hidden'}
              variant="primaryActionInverted"
              onClick={() => dispatch(decrementStep())}
            >
              <Box color="currentcolor">
                <ChevronLeft size={16} strokeWidth="3" />
              </Box>
              <Text ml={2}>Back</Text>
            </MinterButton>
            <MinterButton
              variant={valid ? 'primaryAction' : 'primaryActionInactive'}
              onClick={async () => {
                if (!valid) {
                  return;
                }
                switch (state.step) {
                  case 'file_upload': {
                    return dispatch(incrementStep());
                  }
                  case 'asset_details': {
                    return dispatch(incrementStep());
                  }
                  case 'collection_select': {
                    onOpen();
                    return dispatch(mintTokenAction());
                  }
                }
              }}
              ml={4}
            >
              {state.step === 'collection_select' ? 'Create' : 'Next'}
            </MinterButton>
            <StatusModal
              isOpen={isOpen}
              onClose={() => {
                onClose();
                setLocation('/collections');
                dispatch(setStatus({ method: 'mintToken', status: 'ready' }));
              }}
              status={status.status}
            />
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
          <LeftContent />
          <Box pb={10} w="100%" />
        </Box>
      </Flex>
      {state.step === 'file_upload' && !state.artifactUri ? (
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
          <Preview />
        </Flex>
      )}
    </Flex>
  );
}
