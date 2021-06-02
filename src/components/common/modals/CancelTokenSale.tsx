import React from 'react';
import {
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { MinterButton } from '../../common';
import { useDispatch, useSelector } from '../../../reducer';
import { cancelTokenSaleAction } from '../../../reducer/async/actions';
import FormModal, { BaseModalProps, BaseModalButtonProps } from './FormModal';

interface CancelTokenSaleModalProps extends BaseModalProps {
  contract: string;
  tokenId: number;
  saleId: number;
  saleType: string;
}

export function CancelTokenSaleModal(props: CancelTokenSaleModalProps) {
  const dispatch = useDispatch();
  const initialRef = React.useRef(null);
  return (
    <FormModal
      disclosure={props.disclosure}
      sync={props.sync}
      method="cancelTokenSale"
      dispatchThunk={() =>
        dispatch(
          cancelTokenSaleAction({
            contract: props.contract,
            tokenId: props.tokenId,
            saleId: props.saleId,
            saleType: props.saleType
          })
        )
      }
      initialRef={initialRef}
      pendingMessage="Canceling token sale..."
      completeMessage="Token sale canceled"
      body={onSubmit => (
        <>
          <ModalHeader>Are you sure?</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>Are you sure you want to cancel the sale?</Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="primaryAction" mr={3} onClick={() => onSubmit()}>
              Yes
            </Button>
            <Button
              variant="cancelAction"
              onClick={() => props.disclosure.onClose()}
            >
              No
            </Button>
          </ModalFooter>
        </>
      )}
    />
  );
}

interface CancelTokenSaleButtonProps extends BaseModalButtonProps {
  contract: string;
  tokenId: number;
  saleId: number;
  saleType: string;
}

export function CancelTokenSaleButton(props: CancelTokenSaleButtonProps) {
  const disclosure = useDisclosure();
  const { status } = useSelector(s => s.status.cancelTokenSale)
  
  return (
    <>
      <MinterButton variant="cancelAction" onClick={disclosure.onOpen} disabled={status === 'in_transit'}>
        Cancel sale
      </MinterButton>

      <CancelTokenSaleModal
        {...props}
        disclosure={disclosure}
        sync={props.sync}
      />
    </>
  );
}
