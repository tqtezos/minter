import React, {
  useState,
  MutableRefObject,
  Dispatch,
  SetStateAction
} from 'react';
import {
  Box,
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
import { Check, CheckCircle, AlertCircle, X } from 'react-feather';
import { MinterButton } from '../../common';
import { useSelector, useDispatch } from '../../../reducer';
import { listTokenAction } from '../../../reducer/async/actions';
import { clearError, setStatus, Status } from '../../../reducer/slices/status';

interface FormProps {
  initialRef: MutableRefObject<null>;
  onSubmit: () => void;
  salePrice: string;
  setSalePrice: Dispatch<SetStateAction<string>>;
}

function FormFixedPrice({
  initialRef,
  onSubmit,
  salePrice,
  setSalePrice
}: FormProps) {
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
            <MinterButton variant="primaryAction" onClick={() => onSubmit()}>
              <Check />
            </MinterButton>
          </Box>
        </Flex>
      </ModalBody>
      <ModalFooter />
    </>
  );
}

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
          Listing token for sale...
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
          Listing complete
        </Heading>
        <MinterButton variant="primaryAction" onClick={() => onClose()}>
          Close
        </MinterButton>
      </Flex>
    );
  }
  return null;
}

interface SellTokenButtonProps {
  contract: string;
  tokenId: number;
}

export function SellTokenButton(props: SellTokenButtonProps) {
  const status = useSelector(s => s.status.listToken);
  const dispatch = useDispatch();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);

  const [salePrice, setSalePrice] = useState('');

  const onSubmit = async () => {
    const price = Math.floor(Number(salePrice) * 1000000);
    dispatch(
      listTokenAction({
        ...props,
        salePrice: Number.isNaN(price) ? 0 : price
      })
    );
  };

  const close = () => {
    if (status.status !== 'in_transit') {
      dispatch(setStatus({ method: 'listToken', status: 'ready' }));
      onClose();
    }
  };

  return (
    <>
      <MinterButton variant="primaryAction" onClick={onOpen}>
        List for sale
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
            <FormFixedPrice
              initialRef={initialRef}
              onSubmit={onSubmit}
              salePrice={salePrice}
              setSalePrice={setSalePrice}
            />
          ) : (
            <Content
              isOpen={isOpen}
              status={status}
              onClose={() => close()}
              onCancel={() => {
                onClose();
                dispatch(clearError({ method: 'listToken' }));
                dispatch(setStatus({ method: 'listToken', status: 'ready' }));
              }}
              onRetry={() => {
                dispatch(clearError({ method: 'listToken' }));
                onSubmit();
              }}
            />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
