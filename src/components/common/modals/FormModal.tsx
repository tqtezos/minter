import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  Spinner,
  Flex,
  Heading,
  UseDisclosureReturn
} from '@chakra-ui/react';
import { CheckCircle, AlertCircle, X } from 'react-feather';
import { MinterButton } from '../../common';
import { useSelector, useDispatch } from '../../../reducer';
import {
  clearError,
  setStatus,
  Status,
  Method
} from '../../../reducer/slices/status';

interface ContentProps {
  isOpen: boolean;
  onClose: () => void;
  onRetry: () => void;
  onCancel: () => void;
  status: Status;
  sync: boolean;
  pendingMessage?: React.ReactNode;
  pendingAsyncMessage?: React.ReactNode;
  completeMessage?: React.ReactNode;
  errorMessage?: React.ReactNode;
}

function Content(props: ContentProps) {
  const { status, onClose, onRetry, onCancel } = props;
  if (status.error) {
    return (
      <Flex flexDir="column" align="center" px={4} py={10}>
        <Box color="brand.blue" mb={6}>
          <AlertCircle size="70px" />
        </Box>
        <Heading size="lg" textAlign="center" color="gray.500" mb={6}>
          {props.errorMessage || 'Operation failed'}
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
          {props.sync
            ? props.pendingMessage || 'Operation pending...'
            : props.pendingAsyncMessage || 'Opening wallet...'}
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
          {props.completeMessage || 'Operation complete'}
        </Heading>
        <MinterButton variant="primaryAction" onClick={() => onClose()}>
          Close
        </MinterButton>
      </Flex>
    );
  }
  return null;
}

export type AsyncThunkActionResult = { requestId: string } & Promise<{
  meta: { requestStatus: 'fulfilled' | 'rejected' };
}>;

interface FormModalProps {
  // Required Props
  disclosure: UseDisclosureReturn;
  method: Method;
  dispatchThunk: () => AsyncThunkActionResult;
  // Optional Props
  sync?: boolean;
  body?: (onSubmit: () => Promise<void>) => React.ReactNode;
  dispatchOnOpen?: boolean;
  initialRef?: React.MutableRefObject<null>;
  onComplete?: () => void;
  afterClose?: () => void;
  pendingMessage?: React.ReactNode;
  pendingAsyncMessage?: React.ReactNode;
  completeMessage?: React.ReactNode;
}

export default function FormModal(props: FormModalProps) {
  const { sync = false, dispatchOnOpen = false, onComplete, method } = props;
  const { isOpen, onOpen, onClose } = props.disclosure;
  const [requestId, setRequestId] = useState<string | null>(null);
  const status = useSelector(s => s.status[props.method]);
  const dispatch = useDispatch();
  const notification = useSelector(s =>
    s.notifications.find(
      n => n.requestId === requestId && n.status === 'pending' && !n.delivered
    )
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const onSubmit = async () => {
    const result = props.dispatchThunk();
    setRequestId(result.requestId);
    dispatch(setStatus({ method, status: 'in_transit' }));
    const requestStatus = (await result).meta.requestStatus;
    if (requestStatus === 'fulfilled') {
      dispatch(setStatus({ method, status: sync ? 'complete' : 'ready' }));
      onComplete?.call(null);
    }
  };

  const hasError = status.error !== null;

  useEffect(() => {
    if (!requestId && isOpen && dispatchOnOpen && !hasError) {
      onSubmit();
    }
  }, [isOpen, dispatchOnOpen, hasError, onSubmit, requestId]);

  const closeAndReset = (withCallback = true) => {
    onClose();
    setRequestId(null);
    dispatch(clearError({ method: props.method }));
    withCallback && props.afterClose && props.afterClose();
  };

  const closeIfReadyOrComplete = () => {
    if (status.status !== 'in_transit' || hasError) {
      closeAndReset();
    }
  };

  useEffect(() => {
    if (!sync && isOpen && !hasError && notification) {
      return closeAndReset();
    } else if (!isOpen && hasError) {
      return onOpen();
    }
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => closeIfReadyOrComplete()}
        initialFocusRef={props.initialRef}
        closeOnEsc={false}
        closeOnOverlayClick={false}
        onEsc={() => closeIfReadyOrComplete()}
        onOverlayClick={() => closeIfReadyOrComplete()}
      >
        <ModalOverlay />
        <ModalContent mt={40}>
          {status.status === 'ready' ? (
            props.body ? (
              props.body(onSubmit)
            ) : null
          ) : (
            <Content
              sync={sync}
              isOpen={isOpen}
              status={status}
              onClose={() => closeIfReadyOrComplete()}
              onCancel={() => closeAndReset(false)}
              onRetry={() => {
                dispatch(clearError({ method: props.method }));
                onSubmit();
              }}
              pendingMessage={props.pendingMessage}
              pendingAsyncMessage={props.pendingAsyncMessage}
              completeMessage={props.completeMessage}
            />
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export interface BaseModalProps {
  disclosure: UseDisclosureReturn;
  sync?: boolean;
}

export interface BaseModalButtonProps {
  sync?: boolean;
}
