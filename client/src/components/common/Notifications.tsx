import { useToast } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from '../../reducer';
import {
  deliverNotification,
  readNotification
} from '../../reducer/slices/notifications';
import _ from 'lodash';

export default function Notifications() {
  const toast = useToast();
  const dispatch = useDispatch();
  const notifications = useSelector(
    state =>
      state.notifications.filter(({ read, delivered }) => !read && !delivered),
    (left, right) =>
      _.isEqual(
        _.uniq(_.map(left, n => n.requestId)),
        _.uniq(_.map(right, n => n.requestId))
      )
  );

  useEffect(() => {
    for (let notification of notifications) {
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
      dispatch(deliverNotification(notification.requestId));
    }
  }, [notifications, dispatch, toast]);

  return <></>;
}
