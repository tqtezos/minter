import React from 'react';
import {
  Box,
  Button,
  Flex,
  Spinner,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { CheckCircle, AlertCircle, X } from 'react-feather';
import { MinterButton } from '../../common';
import { useSelector, useDispatch } from '../../../reducer';
import { cancelTokenSaleAction } from '../../../reducer/async/actions';
import { clearError, setStatus, Status } from '../../../reducer/slices/status';

interface ContentProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onCancel: () => void;
  status: Status;
}

function Content({ status, onClose, onRetry, onCancel }: ContentProps) {
  if (status.error) {
    return (
      <Flex flexDir="column" align="center" px={4} py={10}>
        <Box color="brand.blue" mb={6}>
          <AlertCircle size="70px" />
        </Box>
        <Heading size="lg" textAlign="center" color="gray.500" mb={6}>
          Error Transferring Token
        </Heading>
        <Flex flexDir="row" justify="center">
          <MinterButton variant="primaryAction" onClick={() => onRetry()}>
            Retry
          </MinterButton>
          <MinterButton
            variant="tertiaryAction"
            onClick={() => onCancel()}
            display="flex"
            alignItems="center"
            ml={4}
          >
            <Box color="currentcolor">
              <X size={16} strokeWidth="3" />
            </Box>
            <Text fontSize={16} ml={1} fontWeight="600">
              Close
            </Text>
          </MinterButton>
        </Flex>
      </Flex>
    );
  }
  if (status.status === 'in_transit') {
    return (
      <Flex flexDir="column" align="center" px={4} py={10}>
        <Spinner size="xl" mb={6} color="gray.300" />
        <Heading size="lg" textAlign="center" color="gray.500">
          Canceling sale...
        </Heading>
      </Flex>
    );
  }
  if (status.status === 'complete') {
    return (
      <Flex flexDir="column" align="center" px={4} py={10}>
        <Box color="brand.blue" mb={6}>
          <CheckCircle size="70px" />
        </Box>
        <Heading size="lg" textAlign="center" color="gray.500" mb={6}>
          Listing canceled
        </Heading>
        <MinterButton variant="primaryAction" onClick={() => onClose()}>
          Close
        </MinterButton>
      </Flex>
    );
  }
  return null;
}

interface CancelTokenSaleButtonProps {
  contract: string;
  tokenId: number;
}

export function CancelTokenSaleButton(props: CancelTokenSaleButtonProps) {
  const status = useSelector(s => s.status.cancelTokenSale);
  const dispatch = useDispatch();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);

  const onSubmit = async () => {
    dispatch(
      cancelTokenSaleAction({
        ...props
      })
    );
  };

  const close = () => {
    if (status.status !== 'in_transit') {
      dispatch(setStatus({ method: 'cancelTokenSale', status: 'ready' }));
      onClose();
    }
  };

  return (
    <>
      <MinterButton variant="cancelAction" onClick={onOpen}>
        Cancel sale
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
          {status.status === 'ready' ? (
            <>
              <ModalHeader>Are you sure?</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>Are you sure you want to cancel the sale?</Text>
              </ModalBody>
              <ModalFooter>
                <Button variant="primaryAction" mr={3} onClick={onSubmit}>
                  Yes
                </Button>
                <Button variant="cancelAction" onClick={onClose}>
                  No
                </Button>
              </ModalFooter>
            </>
          ) : (
            <Content
              isOpen={isOpen}
              status={status}
              onClose={() => close()}
              onCancel={() => {
                onClose();
                dispatch(clearError({ method: 'cancelTokenSale' }));
                dispatch(
                  setStatus({ method: 'cancelTokenSale', status: 'ready' })
                );
              }}
              onRetry={() => {
                dispatch(clearError({ method: 'cancelTokenSale' }));
                onSubmit();
              }}
            />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
