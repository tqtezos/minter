import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { Box, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { MinterButton } from '../common';
import Form from './Form';
import FileUpload, { CsvFileUpload } from './FileUpload';
import CollectionSelect from './CollectionSelect';
// import Preview from './Preview';
import Confirmation from './Confirmation';
import { ChevronLeft, X } from 'react-feather';

import { useSelector, useDispatch } from '../../reducer';
import {
  clearForm,
  CreateNftState,
  decrementStep,
  incrementStep,
  steps
} from '../../reducer/slices/createNft';
import { mintTokenAction } from '../../reducer/async/actions';
import { validateCreateNftStep } from '../../reducer/validators/createNft';
import FormModal from '../common/modals/FormModal';

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
          <Flex align="center" marginY={12}>
            <Box
              flex="1"
              borderBottom="1px solid"
              borderColor="brand.lightGray"
            />
            <Text color="brand.blue" fontWeight="700" paddingX={5}>
              OR
            </Text>
            <Box
              flex="1"
              borderBottom="1px solid"
              borderColor="brand.lightGray"
            />
          </Flex>
          <CsvFileUpload />
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
  const dispatch = useDispatch();
  const [, setLocation] = useLocation();
  const disclosure = useDisclosure();
  const { onOpen } = disclosure;

  useEffect(() => {
    if (system.status !== 'WalletConnected') {
      setLocation('/');
    }
  });

  const stepIsValid = validateCreateNftStep(state);

  return (
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
                setLocation('/collections');
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
              onClick={() => {
                if (!stepIsValid) return;
                switch (state.step) {
                  case 'file_upload': {
                    return dispatch(incrementStep());
                  }
                  case 'asset_details': {
                    return dispatch(incrementStep());
                  }
                  case 'confirm': {
                    return onOpen();
                  }
                }
              }}
              ml={4}
            >
              {state.step === 'confirm' ? 'Create' : 'Next'}
            </MinterButton>
            <FormModal
              disclosure={disclosure}
              method="mintToken"
              dispatchThunk={() => dispatch(mintTokenAction())}
              onComplete={() => dispatch(clearForm())}
              afterClose={() => setLocation('/collections')}
              dispatchOnOpen={true}
              pendingAsyncMessage={
                <>
                  Opening wallet...
                  <br />
                  <Text
                    fontSize="1rem"
                    fontWeight="normal"
                    marginTop={4}
                    textAlign="center"
                    color="gray.500"
                  >
                    <span role="img" aria-label="lightbulb">
                      🌱
                    </span>{' '}
                    Minting on Tezos produces 1,500,000 times less CO2 emissions
                    than Ethereum.
                  </Text>
                </>
              }
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
  );
}
