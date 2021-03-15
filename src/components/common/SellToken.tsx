import React, { useState, MutableRefObject } from 'react';
import {
  Box,
  Button,
  Flex,
  Spinner,
  Heading,
  FormControl,
  Input,
  InputGroup,
  InputLeftElement,
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
import { Check, CheckCircle } from 'react-feather';
import { MinterButton } from '../common';
import { useSelector, useDispatch } from '../../reducer';
import { listTokenAction, cancelTokenSaleAction } from '../../reducer/async/actions';
import { setStatus } from '../../reducer/slices/status';

interface FormProps {
  initialRef: MutableRefObject<null>;
  onSubmit: (form: { salePrice: string }) => void;
}

interface SellTokenButtonProps {
  contract: string;
  tokenId: number;
}

function FormFixedPrice({ initialRef, onSubmit }: FormProps) {
  const [salePrice, setSalePrice] = useState('');
  return (
    <>
      <ModalHeader>Set your price</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Flex>
        <FormControl>
          <InputGroup>
            <InputLeftElement
              pointerEvents="none"
              color="gray.900"
              fontSize="1.2em"
              children="ꜩ"
            />
            <Input
              autoFocus={true}
              ref={initialRef}
              placeholder="Enter sale amount"
              value={salePrice}
              onChange={e => setSalePrice(e.target.value)}
            />
          </InputGroup>
        </FormControl>
        <Box ml={2}>
        <MinterButton
          variant="primaryAction"
          onClick={() => onSubmit({ salePrice })}
        >
          <Check />
        </MinterButton>
        </Box>
        </Flex>
      </ModalBody>
      <ModalFooter />
    </>
  );
}

export function SellTokenButton(props: SellTokenButtonProps) {
  const { status } = useSelector(s => s.status.listToken);
  const dispatch = useDispatch();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);

  const onSubmit = async (form: { salePrice: string }) => {
    let salePrice = Math.floor(Number(form.salePrice) * 1000000);
    if (Number.isNaN(salePrice)) {
      salePrice = 0;
    }
    dispatch(
      listTokenAction({
        ...props,
        salePrice: salePrice
      })
    );
  };

  const close = () => {
    if (status !== 'in_transit') {
      dispatch(setStatus({ method: 'listToken', status: 'ready' }));
      onClose();
    }
  };

  return (
    <>
      <MinterButton variant="primaryAction" onClick={onOpen}>List for sale</MinterButton>

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
            <FormFixedPrice initialRef={initialRef} onSubmit={onSubmit} />
          ) : null}
          {status === 'in_transit' ? (
            <Flex flexDir="column" align="center" px={4} py={10}>
              <Spinner size="xl" mb={6} color="gray.300" />
              <Heading size="lg" textAlign="center" color="gray.500">
                Listing token for sale...
              </Heading>
            </Flex>
          ) : null}
          {status === 'complete' ? (
            <Flex flexDir="column" align="center" px={4} py={10}>
              <Box color="brand.blue" mb={6}>
                <CheckCircle size="70px" />
              </Box>
              <Heading size="lg" textAlign="center" color="gray.500" mb={6}>
                Listing complete
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

export function CancelTokenSaleButton(props: SellTokenButtonProps) {
  const { status } = useSelector(s => s.status.cancelTokenSale);
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
    if (status !== 'in_transit') {
      dispatch(setStatus({ method: 'cancelTokenSale', status: 'ready' }));
      onClose();
    }
  };

  return (
    <>
      <MinterButton variant="cancelAction" onClick={onOpen}>Cancel sale</MinterButton>

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
            <>
            <ModalHeader>Are you sure?</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to cancel the sale?
              </Text>
            </ModalBody>
            <ModalFooter>
              <Button variant="primaryAction" mr={3} onClick={onSubmit}>Yes</Button>
              <Button variant="cancelAction" onClick={onClose}>No</Button>
            </ModalFooter>
            </>
          ) : null}
          {status === 'in_transit' ? (
            <Flex flexDir="column" align="center" px={4} py={10}>
              <Spinner size="xl" mb={6} color="gray.300" />
              <Heading size="lg" textAlign="center" color="gray.500">
                Canceling sale...
              </Heading>
            </Flex>
          ) : null}
          {status === 'complete' ? (
            <Flex flexDir="column" align="center" px={4} py={10}>
              <Box color="brand.blue" mb={6}>
                <CheckCircle size="70px" />
              </Box>
              <Heading size="lg" textAlign="center" color="gray.500" mb={6}>
                Listing canceled
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
