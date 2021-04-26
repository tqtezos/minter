import React from 'react';
import {
  Box,
  Button,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Text,
  useDisclosure
} from '@chakra-ui/react';
import { MinterButton } from '../../common';
import { useDispatch } from '../../../reducer';
import { buyTokenAction } from '../../../reducer/async/actions';
import { Nft } from '../../../lib/nfts/queries';
import FormModal, { BaseModalProps, BaseModalButtonProps } from './FormModal';

interface BuyTokenModalProps extends BaseModalProps {
  contract: string;
  token: Nft;
}

export function BuyTokenModal(props: BuyTokenModalProps) {
  const dispatch = useDispatch();
  const initialRef = React.useRef(null);
  return (
    <FormModal
      disclosure={props.disclosure}
      sync={props.sync}
      method="buyToken"
      dispatchThunk={() =>
        dispatch(
          buyTokenAction({
            contract: props.contract,
            tokenId: props.token.id,
            tokenSeller: props.token.sale?.seller || '',
            salePrice: props.token.sale?.price || 0
          })
        )
      }
      initialRef={initialRef}
      pendingMessage="Purchasing token..."
      completeMessage="Token purchased"
      body={onSubmit => (
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
              onClick={() => onSubmit()}
              isFullWidth={true}
            >
              Buy now
            </Button>
          </ModalFooter>
        </>
      )}
    />
  );
}

interface BuyTokenButtonProps extends BaseModalButtonProps {
  contract: string;
  token: Nft;
}

export function BuyTokenButton(props: BuyTokenButtonProps) {
  const disclosure = useDisclosure();
  return (
    <>
      <MinterButton minWidth={32} variant="primaryAction" onClick={disclosure.onOpen}>
        Buy
      </MinterButton>

      <BuyTokenModal {...props} disclosure={disclosure} sync={props.sync} />
    </>
  );
}
