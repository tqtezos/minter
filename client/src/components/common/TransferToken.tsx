import React, { useState, useContext } from 'react';
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
  useDisclosure
} from '@chakra-ui/react';
import { Plus } from 'react-feather';
import { MinterButton } from '../common';
import { transferToken } from '../../lib/nfts/actions';
import { SystemContext } from '../../context/system';

interface TransferTokenButtonProps {
  contractAddress: string;
  tokenId: number;
}

export function TransferTokenButton(props: TransferTokenButtonProps) {
  const { system } = useContext(SystemContext);
  const [completed, setCompleted] = useState(false);
  const [transferring, setTransferring] = useState(false);
  const [toAddress, setToAddress] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);

  if (system.status !== 'WalletConnected') {
    return null;
  }

  return (
    <>
      <MinterButton variant="primaryActionInverted" onClick={onOpen}>
        <Box color="currentcolor">
          <Plus size={16} strokeWidth="3" />
        </Box>
        <Text ml={2}>Transfer Token</Text>
      </MinterButton>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (!transferring) onClose();
        }}
        initialFocusRef={initialRef}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        onEsc={() => {
          if (!transferring) onClose();
        }}
        onOverlayClick={() => {
          if (!transferring) onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent mt={40}>
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
              onClick={() => {
                if (transferring) {
                  return;
                }
                setTransferring(true);
                transferToken(
                  system,
                  props.contractAddress,
                  props.tokenId,
                  toAddress
                ).then(() => {
                  onClose();
                });
              }}
            >
              Transfer
            </MinterButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
