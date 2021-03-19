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
import { CheckCircle } from 'react-feather';
import { MinterButton } from '../common';
import { useSelector, useDispatch } from '../../reducer';
import { buyTokenAction } from '../../reducer/async/actions';
import { setStatus } from '../../reducer/slices/status';
import { AssetContract, Nft } from '../../lib/nfts/queries';

interface BuyTokenButtonProps {
  contract: AssetContract;
  token: Nft;
}

export function BuyTokenButton(props: BuyTokenButtonProps) {
  const { status } = useSelector(s => s.status.buyToken);
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
    if (status !== 'in_transit') {
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
          {status === 'ready' ? (
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
          ) : null}
          {status === 'in_transit' ? (
            <Flex flexDir="column" align="center" px={4} py={10}>
              <Spinner size="xl" mb={6} color="gray.300" />
              <Heading size="lg" textAlign="center" color="gray.500">
                Purchasing token...
              </Heading>
            </Flex>
          ) : null}
          {status === 'complete' ? (
            <Flex flexDir="column" align="center" px={4} py={10}>
              <Box color="brand.blue" mb={6}>
                <CheckCircle size="70px" />
              </Box>
              <Heading size="lg" textAlign="center" color="gray.500" mb={6}>
                Token purchased
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
