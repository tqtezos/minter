import React, {
  useState,
  MutableRefObject,
  SetStateAction,
  Dispatch,
  useEffect
} from 'react';
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
  useDisclosure,
  Spinner,
  Flex,
  Heading
} from '@chakra-ui/react';
import { CheckCircle, Plus, AlertCircle, X } from 'react-feather';
import { MinterButton } from '../../common';
import { useSelector, useDispatch } from '../../../reducer';
import { createAssetContractAction } from '../../../reducer/async/actions';
import { clearError, setStatus, Status } from '../../../reducer/slices/status';

interface FormProps {
  initialRef: MutableRefObject<null>;
  onSubmit: (form: { contractName: string }) => void;
  contractName: string;
  setContractName: Dispatch<SetStateAction<string>>;
}

function Form({
  initialRef,
  onSubmit,
  contractName,
  setContractName
}: FormProps) {
  return (
    <>
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
          onClick={() => onSubmit({ contractName })}
        >
          Create Collection
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
          Error Creating Collection
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
          Creating collection...
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
          Collection created
        </Heading>
        <MinterButton variant="primaryAction" onClick={() => onClose()}>
          Close
        </MinterButton>
      </Flex>
    );
  }
  return null;
}

export function CreateCollectionButton(props: { sync?: boolean }) {
  const [requestId, setRequestId] = useState<string | null>(null);
  const status = useSelector(s => s.status.createAssetContract);
  const notification = useSelector(s =>
    s.notifications.find(
      n => n.requestId === requestId && n.status === 'warning'
    )
  );
  const dispatch = useDispatch();
  const [contractName, setContractName] = useState('');

  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);

  const onSubmit = async () => {
    const result = dispatch(createAssetContractAction(contractName));
    setRequestId(result.requestId);
    const resolved = await result;
    if (!props.sync && resolved.meta.requestStatus === 'fulfilled') {
      dispatch(setStatus({ method: 'createAssetContract', status: 'ready' }));
    }
  };

  const close = () => {
    if (status.status !== 'in_transit') {
      dispatch(setStatus({ method: 'createAssetContract', status: 'ready' }));
      onClose();
    }
  };

  useEffect(() => {
    if (notification && !props.sync && !status.error) {
      return onClose();
    } else if (!isOpen && status.error) {
      return onOpen();
    }
  });

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
              contractName={contractName}
              setContractName={setContractName}
            />
          ) : (
            <Content
              isOpen={isOpen}
              status={status}
              onClose={() => close()}
              onCancel={() => {
                onClose();
                dispatch(clearError({ method: 'createAssetContract' }));
                dispatch(
                  setStatus({ method: 'createAssetContract', status: 'ready' })
                );
              }}
              onRetry={() => {
                dispatch(clearError({ method: 'createAssetContract' }));
                onSubmit();
              }}
            />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
