import React, {
  useState,
  MutableRefObject,
  SetStateAction,
  Dispatch
} from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure,
  UseDisclosureReturn
} from '@chakra-ui/react';
import { Plus } from 'react-feather';
import { MinterButton } from '../../common/index';
import { useDispatch } from '../../../reducer';
import { transferTokenAction } from '../../../reducer/async/actions';
import FormModal, { BaseModalProps, BaseModalButtonProps } from './FormModal';

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

interface TransferTokenModalProps extends BaseModalProps {
  contractAddress: string;
  tokenId: number;
}

export function TransferTokenModal(props: TransferTokenModalProps) {
  const [toAddress, setToAddress] = useState('');
  const dispatch = useDispatch();
  const initialRef = React.useRef(null);
  return (
    <FormModal
      disclosure={props.disclosure}
      sync={props.sync}
      method="transferToken"
      submit={() =>
        dispatch(
          transferTokenAction({
            contract: props.contractAddress,
            tokenId: props.tokenId,
            to: toAddress
          })
        )
      }
      cleanup={() => setToAddress('')}
      initialRef={initialRef}
      pendingMessage="Transferring token..."
      completeMessage="Transfer complete"
      form={onSubmit => (
        <Form
          initialRef={initialRef}
          onSubmit={onSubmit}
          toAddress={toAddress}
          setToAddress={setToAddress}
        />
      )}
    />
  );
}

interface TransferTokenButtonProps extends BaseModalButtonProps {
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
      <TransferTokenModal
        {...props}
        disclosure={disclosure}
        sync={props.sync}
      />
    </>
  );
}
