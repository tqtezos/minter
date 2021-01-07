import { mkBetterCallDev } from './betterCallDev';
import { OperationStatusType } from '../generated/graphql_schema';

export async function contractOperationStatus(
  contractAddress: string,
  hash: string,
  since: string | undefined,
  bcdApiUrl: string,
  bcdNetwork: string
) {
  const bcd = mkBetterCallDev(bcdApiUrl, bcdNetwork);
  const op = await bcd.contractOperation(
    contractAddress,
    hash,
    since ? since : undefined
  );

  return op
    ? {
        status:
          op.status === 'applied'
            ? OperationStatusType.Applied
            : OperationStatusType.Failed,
        timestamp: op.timestamp,
        error: op.errors && op.errors.length > 0 ? op.errors[0] : undefined
      }
    : null;
}
