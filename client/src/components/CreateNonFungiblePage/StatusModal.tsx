import React from 'react';
import {
  Box,
  Flex,
  Spinner,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent
} from '@chakra-ui/react';
import { CheckCircle } from 'react-feather';
import { MinterButton } from '../common';
import { CreateStatus } from './reducer';

interface StatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  createStatus: CreateStatus;
}

export default function StatusModal(props: StatusModalProps) {
  const { isOpen, onClose, createStatus } = props;
  const initialRef = React.useRef(null);

  const close = () => {
    if (createStatus === CreateStatus.Complete) {
      onClose();
    }
  };

  return (
    <>
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
          {createStatus === CreateStatus.InProgress ? (
            <Flex flexDir="column" align="center" px={4} py={10}>
              <Spinner size="xl" mb={6} color="gray.300" />
              <Heading size="lg" textAlign="center" color="gray.500">
                Creating token...
              </Heading>
            </Flex>
          ) : null}
          {createStatus === CreateStatus.Complete ? (
            <Flex flexDir="column" align="center" px={4} py={10}>
              <Box color="brand.blue" mb={6}>
                <CheckCircle size="70px" />
              </Box>
              <Heading size="lg" textAlign="center" color="gray.500" mb={6}>
                Token creation complete
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
