import React, { useState, useContext, MutableRefObject } from 'react';
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
import { transferToken } from '../../lib/nfts/actions';
import { SystemContext } from '../../context/system';
import { SystemWithWallet } from '../../lib/system';

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

enum Status {
  Ready = 'ready',
  InProgress = 'inProgress',
  Complete = 'complete'
}

export function TransferTokenButton(props: TransferTokenButtonProps) {
  const { system } = useContext(SystemContext);
  const [status, setStatus] = useState<Status>(Status.Ready);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);

  if (system.status !== 'WalletConnected') {
    return null;
  }

  const onSubmit = async (form: { toAddress: string }) => {
    setStatus(Status.InProgress);
    const op = await transferToken(
      system,
      props.contractAddress,
      props.tokenId,
      form.toAddress
    );
    await op.confirmation();
    setStatus(Status.Complete);
  };

  const close = () => {
    if (status !== Status.InProgress) {
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
          {status === Status.Ready ? (
            <Form initialRef={initialRef} onSubmit={onSubmit} />
          ) : null}
          {status === Status.InProgress ? (
            <Flex flexDir="column" align="center" px={4} py={10}>
              <Spinner size="xl" mb={6} color="gray.300" />
              <Heading size="lg" textAlign="center" color="gray.500">
                Transferring token...
              </Heading>
            </Flex>
          ) : null}
          {status === Status.Complete ? (
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
