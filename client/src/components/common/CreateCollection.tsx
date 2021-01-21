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
import { createAssetContract } from '../../lib/nfts/actions';
import { SystemContext } from '../../context/system';

export function CreateCollectionButton() {
  const { system } = useContext(SystemContext);
  const [completed, setCompleted] = useState(false);
  const [originating, setOriginating] = useState(false);
  const [contractName, setContractName] = useState('');
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
        <Text ml={2}>New Collection</Text>
      </MinterButton>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          if (!originating) onClose();
        }}
        initialFocusRef={initialRef}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        onEsc={() => {
          if (!originating) onClose();
        }}
        onOverlayClick={() => {
          if (!originating) onClose();
        }}
      >
        <ModalOverlay />
        <ModalContent mt={40}>
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
              onClick={() => {
                if (originating) {
                  return;
                }
                setOriginating(true);
                createAssetContract(system, contractName).then(() => {
                  onClose();
                });
              }}
            >
              Create Collection
            </MinterButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}
