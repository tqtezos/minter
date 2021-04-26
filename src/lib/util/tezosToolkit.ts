import { TezosToolkit } from '@taquito/taquito';

export const setConfirmationPollingInterval = async (
  tzToolkit: TezosToolkit
) => {
  const constants = await tzToolkit.rpc.getConstants();

  // Polling interval has to be smaller than the time between block
  // or TezosToolkit throws an exception. Here we pick 1/5 of the time
  // between blocks.
  const confirmationPollingIntervalSecond =
    Number(constants.time_between_blocks[0]) / 5;
  tzToolkit.setProvider({ config: { confirmationPollingIntervalSecond } });
};
