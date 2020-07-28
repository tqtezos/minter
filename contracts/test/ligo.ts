import * as child from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { $log } from '@tsed/logger';

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
