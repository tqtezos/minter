import React, { useEffect, useState } from 'react';
import {
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { MdCheckCircle, MdClose } from 'react-icons/md';
import { Status } from '../../reducer/slices/status';

interface QueueModalProps {
  isOpen: boolean;
  items: Array<Status>;
}

export default function QueueModal(props: QueueModalProps) {

  const [items, setItems] = useState<Array<Status>>(props.items);

  function onDismiss(id: String) {
    setItems(items.filter(r => r.contract !== id));
  }

  useEffect(() => {
    setItems(props.items)
  }, [props.items]);

  return <>
  <List spacing={3}>
    {items.map((i, idx) => (
      <ListItem key={idx}>
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexFlow: 'row nowrap', fontFamily: 'monospace'}}>
          <ListIcon as={MdCheckCircle} color={i?.status === 'in_transit' ? 'yellow.500' : i?.status === 'complete' ? 'green.500' : 'blue.500'}/>
            <span style={{minWidth: '50px'}}>{i?.status}</span>
            &nbsp;
            <span style={{minWidth: '100px', paddingRight: '5px'}}>{i?.contract}</span>
            <span style={{paddingRight: '15px'}}><ListIcon as={MdClose} color={i?.status === 'in_transit' ? 'yellow.500' : i?.status === 'complete' ? 'green.500' : 'blue.500'} onClick={() => onDismiss((i.contract as any))}/></span>
        </div>
      </ListItem>
    ))}
  </List>
  </>;
}
