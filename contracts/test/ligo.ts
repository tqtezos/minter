import * as child from 'child_process'
import * as fs from 'fs';
import * as path from 'path';
import { $log } from '@tsed/logger';


export async function compile_and_load_contract(
  srcFile: string, main: string, dstFile: string): Promise<string> {

  const cwd = path.join(__dirname, '../ligo/');
  const src = path.join(cwd, 'src', srcFile);
  const out = path.join(cwd, 'out', dstFile);
  await compile_contract(cwd, src, main, out);

  return new Promise<string>((resolve, reject) =>
    fs.readFile(out, (err, buff) => err ? reject(err) : resolve(buff.toString()))
  );
}


async function compile_contract(
  cwd: string,
  srcFilePath: string,
  main: string,
  dstFilePath: string): Promise<void> {

  const cmd = `ligo compile-contract ${srcFilePath} ${main} --brief --output=${dstFilePath}`;
  return run_cmd(cwd, cmd);
}

async function run_cmd(cwd: string, cmd: string): Promise<void> {
  return new Promise<void>((resolve, reject) => child.exec(
    cmd,
    { cwd },
    (err, stdout, errout) => errout ? reject(errout) : resolve()
  ));
}