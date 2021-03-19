import React from 'react';
import {
  Box,
  Flex,
  Spinner,
  Heading,
  Modal,
  ModalOverlay,
  ModalContent,
  Text,
  List,
  ListItem,
  ListIcon,
  OrderedList,
  UnorderedList,
} from '@chakra-ui/react';
import { CheckCircle, AlertCircle, X } from 'react-feather';
import { MdCheckCircle } from 'react-icons/md';
import { MinterButton } from '../common';
import StatusModal from './StatusModal';

interface QueueModalProps {
  isOpen: boolean;
  items: Array<any>;
}

function Content({ isOpen, items }: QueueModalProps) {
  return <>
  <List spacing={3}>
    {items.map((i, idx) => (
      <ListItem key={idx}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexFlow: 'row nowrap', font: 'monospace'}}>
          <ListIcon as={MdCheckCircle} color={i?.status === 'in_transit' ? 'yellow.500' : i?.status === 'complete' ? 'green.500' : 'blue.500'}/>
            {i?.status}
            &nbsp;
            {i?.contract}
        </div>
      </ListItem>
    ))}
  </List>
  </>;
}

export default function QueueModal(props: QueueModalProps) {
  const { isOpen, items } = props;
  const initialRef = React.useRef(null);
  console.log(items);

  return (
    <>
      <Content {...props} />
    </>
  );
}
