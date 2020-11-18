export const sleep = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

export const pollUntilTrue = async (
  predicate: () => Promise<boolean>,
  intervalInMs: number,
  timeoutInMs: number,
  timeoutMessage: string = 'Timed out while waiting for Better Call Dev indexer'
): Promise<void> => {
  if (timeoutInMs <= 0) throw new Error(timeoutMessage);
  if (await predicate()) return;

  return sleep(intervalInMs).then(() =>
    pollUntilTrue(
      predicate,
      intervalInMs,
      timeoutInMs - intervalInMs,
      timeoutMessage
    )
  );
};
