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
import { buyTokenAction } from '../../../reducer/async/actions';
import { clearError, setStatus, Status } from '../../../reducer/slices/status';
import { Nft } from '../../../lib/nfts/queries';

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
          Purchasing token...
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
          Token purchased
        </Heading>
        <MinterButton variant="primaryAction" onClick={() => onClose()}>
          Close
        </MinterButton>
      </Flex>
    );
  }
  return null;
}

interface BuyTokenButtonProps {
  contract: string;
  token: Nft;
}

export function BuyTokenButton(props: BuyTokenButtonProps) {
  const status = useSelector(s => s.status.buyToken);
  const dispatch = useDispatch();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);

  const onSubmit = async () => {
    dispatch(
      buyTokenAction({
        contract: props.contract,
        tokenId: props.token.id,
        tokenSeller: props.token.sale?.seller || '',
        salePrice: props.token.sale?.price || 0
      })
    );
  };

  const close = () => {
    if (status.status !== 'in_transit') {
      dispatch(setStatus({ method: 'buyToken', status: 'ready' }));
      onClose();
    }
  };

  return (
    <>
      <MinterButton variant="primaryAction" onClick={onOpen}>
        Buy now
      </MinterButton>

      <Modal
        isOpen={isOpen}
        onClose={() => close()}
        initialFocusRef={initialRef}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        onEsc={() => close()}
        onOverlayClick={() => close()}
        size="xs"
      >
        <ModalOverlay />
        <ModalContent mt={40}>
          {status.status === 'ready' ? (
            <>
              <ModalHeader>Checkout</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Text>
                  You are about to purchase
                  <Box as="span" fontWeight="bold">
                    {' '}
                    {props.token.title} (ꜩ {props.token.sale?.price})
                  </Box>
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button
                  variant="primaryAction"
                  onClick={onSubmit}
                  isFullWidth={true}
                >
                  Buy now
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
                dispatch(clearError({ method: 'buyToken' }));
                dispatch(setStatus({ method: 'buyToken', status: 'ready' }));
              }}
              onRetry={() => {
                dispatch(clearError({ method: 'buyToken' }));
                onSubmit();
              }}
            />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
