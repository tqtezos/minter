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
import { useDispatch, useSelector } from '../../../reducer';
import { buyTokenAction } from '../../../reducer/async/actions';
import { Nft } from '../../../lib/nfts/decoders';
import FormModal, { BaseModalProps, BaseModalButtonProps } from './FormModal';
import tz from '../assets/tezos-sym.svg'

interface BuyTokenModalProps extends BaseModalProps {
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
            contract: props.token.sale?.saleToken.address || '',
            tokenId: props.token.sale?.saleToken.tokenId || 0,
            tokenSeller: props.token.sale?.seller || '',
            salePrice: props.token.sale?.price || 0,
            saleId: props.token.sale?.saleId || 0,
            saleType: props.token.sale?.type || ''
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
                {props.token.title} (<img src={tz} alt="" width={10} height="auto" style={{display: 'inline-block'}}/> {props.token.sale?.price})
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
  token: Nft;
}

export function BuyTokenButton(props: BuyTokenButtonProps) {
  const disclosure = useDisclosure();
  const { status } = useSelector(s => s.status.buyToken)

  return (
    <>
      <MinterButton variant="primaryAction" onClick={disclosure.onOpen} disabled={status === 'in_transit'}>
        Buy now
      </MinterButton>

      <BuyTokenModal {...props} disclosure={disclosure} sync={props.sync} />
    </>
  );
}
