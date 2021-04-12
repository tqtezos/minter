import React from 'react';
import {
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure,
  UseDisclosureReturn
} from '@chakra-ui/react';
import { MinterButton } from '../../common';
import { useDispatch } from '../../../reducer';
import { cancelTokenSaleAction } from '../../../reducer/async/actions';
import FormModal from './FormModal';

interface FormProps {
  onSubmit: () => void;
  onClose: () => void;
}

function Form(props: FormProps) {
  return (
    <>
      <ModalHeader>Are you sure?</ModalHeader>
      <ModalCloseButton />
      <ModalBody>
        <Text>Are you sure you want to cancel the sale?</Text>
      </ModalBody>
      <ModalFooter>
        <Button variant="primaryAction" mr={3} onClick={props.onSubmit}>
          Yes
        </Button>
        <Button variant="cancelAction" onClick={props.onClose}>
          No
        </Button>
      </ModalFooter>
    </>
  );
}

interface CancelTokenSaleModalProps {
  disclosure: UseDisclosureReturn;
  sync: boolean;
  contract: string;
  tokenId: number;
}

export function CancelTokenSaleModal(props: CancelTokenSaleModalProps) {
  const dispatch = useDispatch();
  const initialRef = React.useRef(null);
  return (
    <FormModal
      disclosure={props.disclosure}
      sync={props.sync}
      method="cancelTokenSale"
      submit={() => dispatch(cancelTokenSaleAction({ ...props }))}
      initialRef={initialRef}
      form={onSubmit => (
        <Form onSubmit={onSubmit} onClose={props.disclosure.onClose} />
      )}
    />
  );
}

interface CancelTokenSaleButtonProps {
  contract: string;
  tokenId: number;
}

export function CancelTokenSaleButton(props: CancelTokenSaleButtonProps) {
  const disclosure = useDisclosure();
  return (
    <>
      <MinterButton variant="cancelAction" onClick={disclosure.onOpen}>
        Cancel sale
      </MinterButton>

      <CancelTokenSaleModal {...props} disclosure={disclosure} sync={false} />
    </>
  );
}
