import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Box, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { MinterButton } from '../../src/components/common';
import Form from '../../src/components/CreateNonFungiblePage/Form';
import FileUpload from '../../src/components/CreateNonFungiblePage/CollectionSelect';
import CollectionSelect from '../../src/components/CreateNonFungiblePage/CollectionSelect';
import StatusModal from '../../src/components/CreateNonFungiblePage/StatusModal';
import Confirmation from '../../src/components/CreateNonFungiblePage/Confirmation';
import { ChevronLeft, X } from 'react-feather';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from '../../src/reducer';
import {
  clearForm,
  CreateNftState,
  decrementStep,
  incrementStep,
  steps
} from '../../src/reducer/slices/createNft';
import { mintTokenAction } from '../../src/reducer/async/actions';
import { validateCreateNftStep } from '../../src/reducer/validators/createNft';
import { clearError, setStatus } from '../../src/reducer/slices/status';
import { store } from '../../src/reducer';
import { Provider } from 'react-redux';

function ProgressIndicator({ state }: { state: CreateNftState }) {
  const stepIdx = steps.indexOf(state.step);
  return (
    <Flex
      align="center"
      flexDir="column"
      flex="1"
      display={{
        base: 'none',
        md: 'flex'
      }}
    >
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
      return (
        <Box w="100%" maxWidth="1200px">
          <FileUpload />
        </Box>
      );
    case 'asset_details':
      return (
        <Box w="100%" maxWidth="800px">
          <Form />
        </Box>
      );
    case 'collection_select':
      return (
        <Box w="100%" maxWidth="800px">
          <CollectionSelect />
        </Box>
      );
    case 'confirm':
      return (
        <Box w="100%" maxWidth="800px">
          <Confirmation />
        </Box>
      );
    default:
      return null;
  }
}

export default function CreateNonFungiblePage() {
  const { system, createNft: state } = useSelector(s => s);
  const status = useSelector(s => s.status.mintToken);
  const dispatch = useDispatch();
  const router = useRouter();
  const { isOpen, onClose, onOpen } = useDisclosure();
  useEffect(() => {
    if (system.status !== 'WalletConnected') {
        router.push('/');
    }
  });

  const stepIsValid = validateCreateNftStep(state);

  return (
    <Provider store={store}>
    <Flex flex="1" width="100%" minHeight="0">
      <Flex w="100%" h="100%" flexDir="column" align="center">
        <Flex
          w="100%"
          px={8}
          py={4}
          justify="space-between"
          align="center"
          borderBottomWidth="1px"
          borderBottomColor="brand.brightGray"
        >
          <Flex flex="1">
            <MinterButton
              variant="cancelAction"
              onClick={() => {
                dispatch(clearForm());
                router.push('/collections');
              }}
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
              variant={stepIsValid ? 'primaryAction' : 'primaryActionInactive'}
              onClick={async () => {
                if (!stepIsValid) return;
                switch (state.step) {
                  case 'file_upload': {
                    return dispatch(incrementStep());
                  }
                  case 'asset_details': {
                    return dispatch(incrementStep());
                  }
                  case 'confirm': {
                    onOpen();
                    return dispatch(mintTokenAction());
                  }
                }
              }}
              ml={4}
            >
              {state.step === 'confirm' ? 'Create' : 'Next'}
            </MinterButton>
            <StatusModal
              isOpen={isOpen}
              onClose={() => {
                onClose();
                router.push('/collections');
                dispatch(setStatus({ method: 'mintToken', status: 'ready' }));
                dispatch(clearForm());
              }}
              onRetry={() => {
                dispatch(clearError({ method: 'mintToken' }));
                dispatch(mintTokenAction());
              }}
              onCancel={() => {
                onClose();
                dispatch(clearError({ method: 'mintToken' }));
                dispatch(setStatus({ method: 'mintToken', status: 'ready' }));
              }}
              status={status}
            />
          </Flex>
        </Flex>
        <Flex
          width="100%"
          pt={10}
          px={{
            base: 6,
            md: 28
          }}
          overflowY="auto"
          minHeight="0px"
          flex="1"
          flexDir="column"
          align="center"
        >
          <LeftContent />
          <Box pb={10} w="100%" />
        </Flex>
      </Flex>
    </Flex>
    </Provider>
  );
}
