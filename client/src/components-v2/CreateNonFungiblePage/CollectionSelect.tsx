import React from 'react';
import {
  Flex,
  Heading,
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
  useDisclosure
} from '@chakra-ui/react';
import { MinterButton } from '../common';
import { State, DispatchFn } from './reducer';

// Placeholder data
const collections: { name: string; address: string }[] = [
  { name: 'Minter', address: '123' },
  { name: 'Digital Art', address: '456' },
  { name: 'Misc Stuff', address: '789' }
];

interface CollectionRowProps {
  name: string;
  address: string;
  dispatch: DispatchFn;
  state: State;
}

function NewCollectionButton() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const initialRef = React.useRef(null);
  return (
    <>
      <MinterButton variant="primaryAction" onClick={onOpen}>
        New
      </MinterButton>

      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={initialRef}>
        <ModalOverlay />
        <ModalContent mt={40}>
          <ModalHeader>New Collection</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel fontFamily="mono">Collection Name</FormLabel>
              <Input
                autoFocus={true}
                ref={initialRef}
                placeholder="Input your collection name"
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <MinterButton variant="primaryAction" onClick={onClose}>
              Create Collection
            </MinterButton>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

function CollectionRow(props: CollectionRowProps) {
  const selected = props.state.collectionAddress === props.address;
  return (
    <Flex
      align="center"
      py={2}
      pl={2}
      pr={4}
      mb={4}
      border="1px solid"
      borderColor={selected ? 'brand.blue' : 'brand.brightGray'}
      borderRadius="4px"
      bg={selected ? 'brand.blue' : 'white'}
      _hover={{
        cursor: 'pointer'
      }}
      onClick={() =>
        props.dispatch({
          type: 'select_collection',
          payload: { address: props.address }
        })
      }
    >
      <Flex
        align="center"
        justify="center"
        w={8}
        h={8}
        bg={selected ? 'white' : 'brand.blue'}
        color={selected ? 'brand.blue' : 'white'}
        borderRadius="100%"
      >
        <Text>{props.name[0]}</Text>
      </Flex>
      <Text color={selected ? 'white' : 'black'} pl={4}>
        {props.name}
      </Text>
    </Flex>
  );
}

export default function CollectionSelect(props: {
  state: State;
  dispatch: DispatchFn;
}) {
  return (
    <Flex flexDir="column" pt={8}>
      <Flex
        align="center"
        justify="space-between"
        mb={4}
        pb={4}
        borderBottom="1px solid"
        borderColor="brand.brightGray"
      >
        <Heading size="lg">Collections</Heading>
        <NewCollectionButton />
      </Flex>
      {collections.map(({ name, address }) => {
        return (
          <CollectionRow
            name={name}
            address={address}
            dispatch={props.dispatch}
            state={props.state}
          />
        );
      })}
      ;
    </Flex>
  );
}
