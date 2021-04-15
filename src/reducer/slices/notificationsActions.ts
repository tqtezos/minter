import { createAction } from '@reduxjs/toolkit';
import { Notification } from './notifications';

export const pushNotification = createAction<Notification>(
  'sharedAction/pushNotification'
);

export const readNotification = createAction<string>(
  'sharedAction/readNotification'
);

export const deliverNotification = createAction<string>(
  'sharedAction/deliverNotification'
);

export function pendingNotification(
  requestId: string,
  description: string
): Notification {
  return {
    requestId,
    read: false,
    delivered: false,
    status: 'pending',
    title: 'Pending',
    description,
    kind: null
  };
}

export function fulfilledNotification(
  requestId: string,
  description: string
): Notification {
  return {
    requestId,
    read: false,
    delivered: false,
    status: 'success',
    title: 'Complete',
    description,
    kind: null
  };
}

export function notifyPending(requestId: string, message: string) {
  return pushNotification(pendingNotification(requestId, message));
}

export function notifyFulfilled(requestId: string, message: string) {
  return pushNotification(fulfilledNotification(requestId, message));
}
