import React, {
  useState,
  MutableRefObject,
  SetStateAction,
  Dispatch
} from 'react';
import {
  Box,
  Flex,
  Spinner,
  Heading,
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
  Text,
  useDisclosure,
  UseDisclosureReturn
} from '@chakra-ui/react';
import { CheckCircle, AlertCircle, X, Plus } from 'react-feather';
import { MinterButton } from '../../common/index';
import { useSelector, useDispatch } from '../../../reducer';
import { transferTokenAction } from '../../../reducer/async/actions';
import { clearError, setStatus, Status } from '../../../reducer/slices/status';

interface FormProps {
  initialRef: MutableRefObject<null>;
  onSubmit: (form: { toAddress: string }) => void;
  toAddress: string;
  setToAddress: Dispatch<SetStateAction<string>>;
}

function Form({ initialRef, onSubmit, toAddress, setToAddress }: FormProps) {
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
          Transferring token...
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
          Token transfer complete
        </Heading>
        <MinterButton variant="primaryAction" onClick={() => onClose()}>
          Close
        </MinterButton>
      </Flex>
    );
  }
  return null;
}

interface TransferTokenModalProps {
  contractAddress: string;
  tokenId: number;
  disclosure: UseDisclosureReturn;
}

export function TransferTokenModal(props: TransferTokenModalProps) {
  const status = useSelector(s => s.status.transferToken);
  const dispatch = useDispatch();
  const [toAddress, setToAddress] = useState('');
  const { isOpen, onClose } = props.disclosure;

  const initialRef = React.useRef(null);

  const onSubmit = async () => {
    dispatch(
      transferTokenAction({
        contract: props.contractAddress,
        tokenId: props.tokenId,
        to: toAddress
      })
    );
  };

  const close = () => {
    if (status.status !== 'in_transit') {
      dispatch(setStatus({ method: 'transferToken', status: 'ready' }));
      onClose();
    }
  };

  return (
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
          <Form
            initialRef={initialRef}
            onSubmit={onSubmit}
            toAddress={toAddress}
            setToAddress={setToAddress}
          />
        ) : (
          <Content
            isOpen={isOpen}
            status={status}
            onClose={() => close()}
            onCancel={() => {
              onClose();
              dispatch(clearError({ method: 'transferToken' }));
              dispatch(setStatus({ method: 'transferToken', status: 'ready' }));
            }}
            onRetry={() => {
              dispatch(clearError({ method: 'transferToken' }));
              onSubmit();
            }}
          />
        )}
      </ModalContent>
    </Modal>
  );
}

interface TransferTokenButtonProps {
  contractAddress: string;
  tokenId: number;
}

export function TransferTokenButton(props: TransferTokenButtonProps) {
  const disclosure = useDisclosure();
  return (
    <>
      <MinterButton variant="primaryAction" onClick={disclosure.onOpen}>
        <Box color="currentcolor">
          <Plus size={16} strokeWidth="3" />
        </Box>
        <Text ml={2}>Transfer Token</Text>
      </MinterButton>
      <TransferTokenModal {...props} disclosure={disclosure} />
    </>
  );
}
