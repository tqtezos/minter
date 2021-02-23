import React, { useState, MutableRefObject } from 'react';
import {
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Flex,
  Heading
} from '@chakra-ui/react';
import { CheckCircle, Plus } from 'react-feather';
import { MinterButton } from '../common';

import { useSelector, useDispatch } from '../../reducer';
import { createAssetContractAction } from '../../reducer/async/actions';
import { setStatus } from '../../reducer/slices/status';

interface FormProps {
  initialRef: MutableRefObject<null>;
  onSubmit: (form: { contractName: string }) => void;
}

function Form({ initialRef, onSubmit }: FormProps) {
  const [contractName, setContractName] = useState('');
  return (
    <>
      <ModalHeader>New Collection</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormControl>
          <FormLabel fontFamily="mono">Collection Name</FormLabel>
          <Input
            autoFocus={true}
            ref={initialRef}
            placeholder="Input your collection name"
            value={contractName}
            onChange={e => setContractName(e.target.value)}
          />
        </FormControl>
      </ModalBody>

      <ModalFooter>
        <MinterButton
          variant="primaryAction"
          onClick={() => onSubmit({ contractName })}
        >
          Create Collection
        </MinterButton>
      </ModalFooter>
    </>
  );
}

export function CreateCollectionButton() {
  const { status } = useSelector(s => s.status.createAssetContract);
  const dispatch = useDispatch();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);

  const onSubmit = async (form: { contractName: string }) => {
    dispatch(createAssetContractAction(form.contractName));
  };

  const close = () => {
    if (status !== 'in_transit') {
      dispatch(setStatus({ method: 'createAssetContract', status: 'ready' }));
      onClose();
    }
  };

  return (
    <>
      <MinterButton variant="primaryActionInverted" onClick={onOpen}>
        <Box color="currentcolor">
          <Plus size={16} strokeWidth="3" />
        </Box>
        <Text ml={2}>New Collection</Text>
      </MinterButton>

      <Modal
        isOpen={isOpen}
        onClose={() => close()}
        initialFocusRef={initialRef}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        onEsc={() => close()}
        onOverlayClick={() => close()}
      >
        <ModalOverlay />
        <ModalContent mt={40}>
          {status === 'ready' ? (
            <Form initialRef={initialRef} onSubmit={onSubmit} />
          ) : null}
          {status === 'in_transit' ? (
            <Flex flexDir="column" align="center" px={4} py={10}>
              <Spinner size="xl" mb={6} color="gray.300" />
              <Heading size="lg" textAlign="center" color="gray.500">
                Creating new collection...
              </Heading>
            </Flex>
          ) : null}
          {status === 'complete' ? (
            <Flex flexDir="column" align="center" px={4} py={10}>
              <Box color="brand.blue" mb={6}>
                <CheckCircle size="70px" />
              </Box>
              <Heading size="lg" textAlign="center" color="gray.500" mb={6}>
                Collection created
              </Heading>
              <MinterButton variant="primaryAction" onClick={() => close()}>
                Close
              </MinterButton>
            </Flex>
          ) : null}
        </ModalContent>
      </Modal>
    </>
  );
}
