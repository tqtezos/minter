import React, { useState } from 'react';
import {
  Box,
  Text,
  FormControl,
  FormLabel,
  Input,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure
} from '@chakra-ui/react';
import { Plus } from 'react-feather';
import { MinterButton } from '../../common';
import { useDispatch } from '../../../reducer';
import { createEditionsContractAction } from '../../../reducer/async/actions';
import FormModal, { BaseModalProps, BaseModalButtonProps } from './FormModal';

interface CreateEditionsCollectionModalProps extends BaseModalProps {}

function CreateEditionsCollectionModal(
  props: CreateEditionsCollectionModalProps
) {
  const [contractName, setContractName] = useState('');
  const dispatch = useDispatch();
  const initialRef = React.useRef(null);
  return (
    <FormModal
      disclosure={props.disclosure}
      sync={props.sync}
      method="createEditionsContract"
      dispatchThunk={() => dispatch(createEditionsContractAction(contractName))}
      onComplete={() => setContractName('')}
      initialRef={initialRef}
      pendingMessage="Creating editions collection..."
      completeMessage="Editions collection created"
      body={onSubmit => (
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
            <MinterButton variant="primaryAction" onClick={() => onSubmit()}>
              Create Collection
            </MinterButton>
          </ModalFooter>
        </>
      )}
    />
  );
}

interface CreateEditionsCollectionButtonProps extends BaseModalButtonProps {}

export function CreateEditionsCollectionButton(
  props: CreateEditionsCollectionButtonProps
) {
  const disclosure = useDisclosure();
  return (
    <>
      <MinterButton variant="primaryActionInverted" onClick={disclosure.onOpen}>
        <Box color="currentcolor">
          <Plus size={16} strokeWidth="3" />
        </Box>
        <Text ml={2}>New Edition Set</Text>
      </MinterButton>
      <CreateEditionsCollectionModal
        disclosure={disclosure}
        sync={props.sync}
      />
    </>
  );
}
