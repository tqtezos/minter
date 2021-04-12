import React, {
  useState,
  MutableRefObject,
  Dispatch,
  SetStateAction
} from 'react';
import {
  Box,
  Flex,
  FormControl,
  Input,
  InputGroup,
  InputLeftElement,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { Check } from 'react-feather';
import { MinterButton } from '../../common';
import { useDispatch } from '../../../reducer';
import { listTokenAction } from '../../../reducer/async/actions';
import FormModal from './FormModal';

interface FormProps {
  initialRef: MutableRefObject<null>;
  onSubmit: () => void;
  salePrice: string;
  setSalePrice: Dispatch<SetStateAction<string>>;
}

function Form({ initialRef, onSubmit, salePrice, setSalePrice }: FormProps) {
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

interface SellTokenButtonProps {
  contract: string;
  tokenId: number;
}

export function SellTokenButton(props: SellTokenButtonProps) {
  const disclosure = useDisclosure();
  const [salePrice, setSalePrice] = useState('');
  const dispatch = useDispatch();
  const initialRef = React.useRef(null);
  return (
    <>
      <MinterButton variant="primaryAction" onClick={disclosure.onOpen}>
        List for sale
      </MinterButton>

      <FormModal
        disclosure={disclosure}
        method="listToken"
        submit={() => {
          const price = Math.floor(Number(salePrice) * 1000000);
          const validPrice = Number.isNaN(price) ? 0 : price;
          return dispatch(listTokenAction({ ...props, salePrice: validPrice }));
        }}
        cleanup={() => setSalePrice('')}
        initialRef={initialRef}
        pendingMessage="Creating collection..."
        completeMessage="Collection created"
        form={onSubmit => (
          <Form
            initialRef={initialRef}
            onSubmit={onSubmit}
            salePrice={salePrice}
            setSalePrice={setSalePrice}
          />
        )}
      />
    </>
  );
}
