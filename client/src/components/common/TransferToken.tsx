import React, { useState, MutableRefObject } from 'react';
import {
  Box,
  Flex,
  Spinner,
  Heading,
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
  useDisclosure
} from '@chakra-ui/react';
import { Plus, CheckCircle } from 'react-feather';
import { MinterButton } from '../common';
import { useSelector, useDispatch } from '../../reducer';
import { transferTokenAction } from '../../reducer/async/actions';
import { setStatus } from '../../reducer/slices/status';

interface FormProps {
  initialRef: MutableRefObject<null>;
  onSubmit: (form: { toAddress: string }) => void;
}

function Form({ initialRef, onSubmit }: FormProps) {
  const [toAddress, setToAddress] = useState('');
  return (
    <>
      <ModalHeader>Transfer Token</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <FormControl>
          <FormLabel fontFamily="mono">To Address</FormLabel>
          <Input
            autoFocus={true}
            ref={initialRef}
            placeholder="Input token recipient"
            value={toAddress}
            onChange={e => setToAddress(e.target.value)}
          />
        </FormControl>
      </ModalBody>

      <ModalFooter>
        <MinterButton
          variant="primaryAction"
          onClick={() => onSubmit({ toAddress })}
        >
          Transfer
        </MinterButton>
      </ModalFooter>
    </>
  );
}

interface TransferTokenButtonProps {
  contractAddress: string;
  tokenId: number;
}

export function TransferTokenButton(props: TransferTokenButtonProps) {
  const { status } = useSelector(s => s.status.transferToken);
  const dispatch = useDispatch();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);

  const onSubmit = async (form: { toAddress: string }) => {
    dispatch(
      transferTokenAction({
        contract: props.contractAddress,
        tokenId: props.tokenId,
        to: form.toAddress
      })
    );
  };

  const close = () => {
    if (status !== 'in_transit') {
      dispatch(setStatus({ method: 'transferToken', status: 'ready' }));
      onClose();
    }
  };

  return (
    <>
      <MinterButton variant="primaryAction" onClick={onOpen}>
        <Box color="currentcolor">
          <Plus size={16} strokeWidth="3" />
        </Box>
        <Text ml={2}>Transfer Token</Text>
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
                Transferring token...
              </Heading>
            </Flex>
          ) : null}
          {status === 'complete' ? (
            <Flex flexDir="column" align="center" px={4} py={10}>
              <Box color="brand.blue" mb={6}>
                <CheckCircle size="70px" />
              </Box>
              <Heading size="lg" textAlign="center" color="gray.500" mb={6}>
                Transfer complete
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
