import { useToast } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from '../../reducer';
import {
  deliverNotification,
  readNotification
} from '../../reducer/slices/notificationsActions';
import _ from 'lodash';

export default function Notifications() {
  const toast = useToast();
  const dispatch = useDispatch();
  const notifications = useSelector(
    state =>
      state.notifications.filter(({ read, delivered }) => !read && !delivered),
    _.isEqual
  );

  useEffect(() => {
    for (let notification of notifications) {
      dispatch(deliverNotification(notification.requestId));
      toast({
        title: notification.title,
        description: notification.description,
        status: notification.status,
        duration: 10000,
        isClosable: true,
        onCloseComplete() {
          dispatch(readNotification(notification.requestId));
        }
      });
    }
  }, [notifications, dispatch, toast]);

  return <></>;
}
