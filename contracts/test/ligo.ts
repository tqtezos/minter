import * as child from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { $log } from '@tsed/logger';

import { ContractAbstraction } from '@taquito/taquito/dist/types/contract';
import { ContractProvider } from '@taquito/taquito/dist/types/contract/interface';
import { TezosToolkit, MichelsonMap } from '@taquito/taquito';

export class LigoEnv {
  readonly cwd: string;
  readonly srcDir: string;
  readonly outDir: string;

  constructor(cwd: string, srcDir: string, outDir: string) {
    this.cwd = cwd;
    this.srcDir = srcDir;
    this.outDir = outDir;
  }

  srcFilePath(srcFileName: string): string {
    return path.join(this.srcDir, srcFileName);
  }

  outFilePath(outFileName: string): string {
    return path.join(this.outDir, outFileName);
  }
}

export const defaultEnv: LigoEnv = defaultLigoEnv();

function defaultLigoEnv(): LigoEnv {
  const cwd = path.join(__dirname, '../ligo/');
  const src = path.join(cwd, 'src');
  const out = path.join(cwd, 'out');
  return new LigoEnv(cwd, src, out);
}

export type Contract = ContractAbstraction<ContractProvider>;

export type address = string;

export async function compileAndLoadContract(
  env: LigoEnv,
  srcFile: string,
  main: string,
  dstFile: string
): Promise<string> {
  const src = env.srcFilePath(srcFile);
  const out = env.outFilePath(dstFile);
  await compileContract(env.cwd, src, main, out);

  return new Promise<string>((resolve, reject) =>
    fs.readFile(out, (err, buff) =>
      err ? reject(err) : resolve(buff.toString())
    )
  );
}

async function compileContract(
  cwd: string,
  srcFilePath: string,
  main: string,
  dstFilePath: string
): Promise<void> {
  const cmd = `ligo compile-contract ${srcFilePath} ${main} --brief --output=${dstFilePath}`;
  return runCmd(cwd, cmd);
}

async function runCmd(cwd: string, cmd: string): Promise<void> {
  return new Promise<void>((resolve, reject) =>
    child.exec(cmd, { cwd }, (err, stdout, errout) =>
      errout ? reject(errout) : resolve()
    )
  );
}

export async function originateContract(
  tz: TezosToolkit,
  code: string,
  storage: any,
  name: string
): Promise<Contract> {
  try {
    const originationOp = await tz.contract.originate({
      code,
      init: storage
    });

    //A HACK
    // await delay(5000);

    const contract = await originationOp.contract();
    $log.info(`originated contract ${name} with address ${contract.address}`);
    $log.info(`consumed gas: ${originationOp.consumedGas}`);
    return Promise.resolve(contract);
  } catch (error) {
    const jsonError = JSON.stringify(error, null, 2);
    $log.fatal(`${name} origination error ${jsonError}`);
    return Promise.reject(error);
  }
}
