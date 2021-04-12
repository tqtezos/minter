import React from 'react';
import {
  Box,
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
import { buyTokenAction } from '../../../reducer/async/actions';
import { Nft } from '../../../lib/nfts/queries';
import FormModal from './FormModal';

interface FormProps {
  onSubmit: () => void;
  token: Nft;
}

function Form(props: FormProps) {
  return (
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
          onClick={props.onSubmit}
          isFullWidth={true}
        >
          Buy now
        </Button>
      </ModalFooter>
    </>
  );
}

interface BuyTokenModalProps {
  disclosure: UseDisclosureReturn;
  sync: boolean;
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
      submit={() =>
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
      form={onSubmit => <Form onSubmit={onSubmit} token={props.token} />}
    />
  );
}

interface BuyTokenButtonProps {
  contract: string;
  token: Nft;
}

export function BuyTokenButton(props: BuyTokenButtonProps) {
  const disclosure = useDisclosure();
  return (
    <>
      <MinterButton variant="primaryAction" onClick={disclosure.onOpen}>
        Buy now
      </MinterButton>

      <BuyTokenModal {...props} disclosure={disclosure} sync={false} />
    </>
  );
}
