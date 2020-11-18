import fs from 'fs';
import { TezosToolkit } from '@taquito/taquito';
import { Operation } from '@taquito/taquito/dist/types/operations/operations';
import { SessionContext } from './components/context';
import { ApolloError } from 'apollo-server-express';
import { importKey } from '@taquito/signer';

export async function importKeyFromFile(
  client: TezosToolkit,
  jsonFile: string
) {
  if (!fs.existsSync(jsonFile)) {
    throw Error(`Key file ${jsonFile} doesn't exist!`);
  }
  const json = JSON.parse(fs.readFileSync(jsonFile).toString());
  const { email, password, mnemonic, secret } = json;
  await importKey(client, email, password, mnemonic.join(' '), secret);
  console.log(
    '[Tezos]',
    'Imported key (pkh):',
    await client.signer.publicKeyHash()
  );
  return json;
}

export async function handleErr(fn: () => void) {
  try {
    return fn();
  } catch (e) {
    const jsonErr = JSON.stringify(e, null, 2);
    return jsonErr === '{}' ? e.toString() : jsonErr;
  }
}

async function confirmOperation(
  { pubsub, client }: SessionContext,
  operation: Operation,
  tag: string | undefined
) {
  console.log(`[Tezos] Awaiting confirmation for ${operation.hash}...`);
  try {
    //workaround for https://github.com/ecadlabs/taquito/issues/276:
    //specify fast polling interval relative to time between blocks
    //still may miss confirmation
    const constants = await client.rpc.getConstants();
    const pollingInterval: number =
      Number(constants.time_between_blocks[0]) / 5;
    await operation.confirmation(1, pollingInterval);
  } catch (e) {
    console.log('[Tezos]', 'Error during confirmation:', e);
    return;
  }
  const event = {
    operationConfirmed: {
      hash: operation?.hash,
      time: new Date().toISOString()
    }
  };
  if (tag) {
    pubsub.publish(tag, event);
  }
  console.log(`[Tezos] Operation ${operation.hash} confirmed.`);
}

interface OpError {
  message: string;
}

interface ParsedOpError {
  error: string;
  errors: { with?: any }[];
}

function findFailWith(e: OpError) {
  try {
    const { errors }: ParsedOpError = JSON.parse(e.message);
    return errors.filter((e: any) => e.with)[0]?.with;
  } catch (e) {
    return null;
  }
}

function reportFailWith(e: OpError) {
  const failWith = findFailWith(e);
  if (!failWith) {
    throw e;
  } else {
    const message = 'Operation failed with error';
    const code = 'OPERATION_FAIL_WITH';
    const extensions = { failWith, message: e.message };
    throw new ApolloError(message, code, extensions);
  }
}

export async function publishOperation<A>(
  context: SessionContext,
  operationP: Promise<Operation>,
  eventTags?: { sent: string; confirmed: string },
  forgeOperation?: (op: Operation) => A
) {
  return operationP
    .then(operation => {
      const data = forgeOperation
        ? forgeOperation(operation)
        : { hash: operation.hash };
      const event = { operationSent: data };
      if (eventTags?.sent) {
        context.pubsub.publish(eventTags.sent, event);
      }
      confirmOperation(context, operation, eventTags?.confirmed);
      return data;
    })
    .catch((e: OpError) => reportFailWith(e))
    .then(a => a || null);
}

export const anyValue = Symbol('any');

export function selectObjectByKeys(
  object: any,
  ks: Record<string, any>
): Record<string, any> | null {
  if (object === null) {
    return null;
  }

  if (
    Object.keys(ks).every(
      k =>
        object.hasOwnProperty(k) &&
        (ks[k] === anyValue ? true : ks[k] === object[k])
    )
  ) {
    return object;
  }

  const keys = Object.keys(object);
  for (let key of keys) {
    if (typeof object[key] == 'object') {
      const result = selectObjectByKeys(object[key], ks);
      if (result !== null) {
        return result;
      }
    }
  }

  return null;
}
