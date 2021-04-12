import React, {
  useState,
  MutableRefObject,
  SetStateAction,
  Dispatch
} from 'react';
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
  useDisclosure,
  UseDisclosureReturn
} from '@chakra-ui/react';
import { Plus } from 'react-feather';
import { MinterButton } from '../../common';
import { useDispatch } from '../../../reducer';
import { createAssetContractAction } from '../../../reducer/async/actions';
import FormModal from './FormModal';

interface FormProps {
  initialRef: MutableRefObject<null>;
  onSubmit: (form: { contractName: string }) => void;
  contractName: string;
  setContractName: Dispatch<SetStateAction<string>>;
}

function Form({
  initialRef,
  onSubmit,
  contractName,
  setContractName
}: FormProps) {
  return (
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
        <MinterButton
          variant="primaryAction"
          onClick={() => onSubmit({ contractName })}
        >
          Create Collection
        </MinterButton>
      </ModalFooter>
    </>
  );
}

function CreateCollectionModal(props: {
  sync: boolean;
  disclosure: UseDisclosureReturn;
}) {
  const [contractName, setContractName] = useState('');
  const dispatch = useDispatch();
  const initialRef = React.useRef(null);
  return (
    <FormModal
      disclosure={props.disclosure}
      sync={props.sync}
      method="createAssetContract"
      submit={() => dispatch(createAssetContractAction(contractName))}
      cleanup={() => setContractName('')}
      initialRef={initialRef}
      pendingMessage="Creating collection..."
      completeMessage="Collection created"
      form={onSubmit => (
        <Form
          initialRef={initialRef}
          onSubmit={onSubmit}
          contractName={contractName}
          setContractName={setContractName}
        />
      )}
    />
  );
}

export function CreateCollectionButton({ sync = false }) {
  const disclosure = useDisclosure();
  return (
    <>
      <MinterButton variant="primaryActionInverted" onClick={disclosure.onOpen}>
        <Box color="currentcolor">
          <Plus size={16} strokeWidth="3" />
        </Box>
        <Text ml={2}>New Collection</Text>
      </MinterButton>
      <CreateCollectionModal disclosure={disclosure} sync={sync} />
    </>
  );
}
