import path from 'path';
import Configstore from 'configstore';
import { validateKeyHash, ValidationResult } from '@taquito/utils';
import * as figlet from 'figlet';
import clear from 'clear';
import chalk from 'chalk';
import inquirer from 'inquirer';
import shelljs from 'shelljs';
import { Spinner } from 'clui';

interface ConfigInput {
  network: string;
  rpc: string;
  rpcCustom?: string;
  adminPkh: string;
  adminSk: string;
  marketplaceHasFee: boolean;
  marketplaceFeePercent?: number;
  marketplaceFeeAddress?: string;
  marketplaceAdminOnly: boolean;
}

const stripAnsi = (input: string): string => {
  return input.replace(/[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g, '');
};

// initializes and displays the welcome screen
const init = () => {
  clear();
  console.log(
    "\n" +
    chalk.green(figlet.textSync('>OpenMinter', { font: 'ANSI Shadow' })) +
    "\n\n" +
    chalk.cyan("Welcome to OpenMinter!") +
    "\n\n" +
    "The following questions will help configure and bootstrap a custom\n" +
    "installation of OpenMinter. " +
    chalk.yellow("Please have your wallet private key on hand.") + "\n" +
    "You will be asked for it in order to originate the OpenMinter contracts.\n" +
    "\n"
  );
};

const finish = () => {
  console.log(
    "\n" +
    chalk.bold("Your customized OpenMinter is bootstrapped and ready to go!") + "\n" +
    "\n" +
    "Your customized config is located at " + chalk.yellow("config/custom-bootstrapped.json") + "\n" +
    "We " + chalk.bold("strongly") + " recommend that you create a backup copy" +
    "of this configuration file.\n" +
    "\n\n" +
    "You can now start your customized OpenMinter by running: " + chalk.yellow("yarn start:custom") + "\n" +
    "\n" +
    "‎️‍🔥🔥🔥 The OpenMinter Team 🔥🔥🔥\n"
  );
};

const askConfigQuestions = (): Promise<ConfigInput> => {
  const questions = [
    {
      name: 'network',
      type: 'list',
      choices: ['Mainnet', 'Florencenet'],
      message: 'Select the network to deploy OpenMinter contracts to:',
      filter: function (val: string) {
        return val.toLowerCase();
      },
    },
    {
      name: 'rpc',
      type: 'list',
      choices: (input: any) => {
        let rpcOpts: any[] = [];
        if (input.network === "mainnet") {
          rpcOpts = [
            "https://rpc.tzbeta.net",
            "https://mainnet.smartpy.io",
            "https://api.tez.ie/rpc/mainnet",
            "https://mainnet-tezos.giganode.io",
            "Other"
          ]
        } else if (input.network === "florencenet") {
          rpcOpts = [
            "https://rpctest.tzbeta.net",
            "https://florencenet.smartpy.io",
            "https://api.tez.ie/rpc/florencenet",
            "https://testnet-tezos.giganode.io",
            "Other"
          ]
        }
        return rpcOpts;
      },
      message: 'Select an RPC node to connect to:',
      filter: function (val: string) {
        return val;
      },
    },
    {
      name: 'rpcCustom',
      type: 'input',
      when: (input: any) => input.rpc === "Other",
      message: 'Enter the RPC node you want to connect to:',
      validate: (input: string) => {
        const regex = new RegExp(/^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)?/gi);
        if (input.match(regex)) {
          return true;
        }
        return "Please enter a valid url (starting with http:// or https://)";
      },
      filter: function (val: string) {
        if (val.substr(-1) === '/') {
          val = val.substr(0, val.length - 1);
        }
        return val;
      },
    },
    {
      name: 'adminPkh',
      type: 'input',
      message: 'Enter the wallet address for the admin of the contracts:',
      validate: (input: string) => {
        if (validateKeyHash(input) === ValidationResult.VALID) {
          return true;
        }
        return "Please enter a valid wallet address";
      }
    },
    {
      name: 'marketplaceAdminOnly',
      type: 'confirm',
      message: 'Do you want to only allow the admin address to list items for sale?'
    },
    {
      name: 'marketplaceHasFee',
      type: 'confirm',
      message: 'Do you want to collect a fee on sales in the marketplace?'
    },
    {
      name: 'marketplaceFeePercent',
      type: 'number',
      message: 'Enter the marketplace percentage fee (0-100):',
      when: (input: any) => input.marketplaceHasFee,
      validate: (input: number) => {
        if (Number.isNaN(input) || !Number.isInteger(input) || input < 0 || input > 100) {
          return "Please enter a whole number between 0 and 100";
        }
        return true;
      }
    },
    {
      name: 'marketplaceFeeAddress',
      type: 'input',
      message: 'Enter the address of the wallet that will receive the fee:',
      when: (input: any) => input.marketplaceHasFee,
      validate: (input: string) => {
        if (validateKeyHash(input) === ValidationResult.VALID) {
          return true;
        }
        return "Please enter a valid wallet address";
      }
    },
    {
      name: 'adminSk',
      type: 'password',
      message: 'Enter the secret key of the wallet that will originate the contracts:'
    },
  ]

  return inquirer.prompt(questions);
}

const getConfigstore = (): Configstore => {
  const configFileName = path.join(
    __dirname,
    `../config/custom.json`
  );
  return new Configstore('minter', {}, { configPath: configFileName });
}

const getBootstrappedConfigstore = (): Configstore => {
  const configFileName = path.join(
    __dirname,
    `../config/custom-bootstrapped.json`
  );
  return new Configstore('minter', {}, { configPath: configFileName });
}

const saveConfig = (input: ConfigInput) => {
  const config = getConfigstore();
  config.set('network', input.network);
  config.set('rpc', input.rpc === "Other" ? input.rpcCustom : input.rpc);
  config.set('bcd.api', "https://api.better-call.dev");
  config.set('bcd.gui', "https://better-call.dev");
  config.set('tzkt.api', input.network === "mainnet" ? "https://api.mainnet.tzkt.io" : "https://api.florencenet.tzkt.io");
  config.set('admin.address', input.adminPkh);
  config.set('admin.secret', input.adminSk);
  config.set('ipfsApi', "https://minter-api.tqhosted.com");
  config.set('ipfsGateway', "https://tqtezos.mypinata.cloud");

  config.set("contractOpts.marketplace.adminOnly", input.marketplaceAdminOnly);

  if (input.marketplaceHasFee) {
    config.set("contractOpts.marketplace.fee.percent", input.marketplaceFeePercent);
    config.set("contractOpts.marketplace.fee.address", input.marketplaceFeeAddress);
  }
}

const bootstrapContracts = async (): Promise<void> => {
  console.log(
    "\n" +
    chalk.cyan("Bootstrapping contracts...")
  );

  shelljs.rm('-f', path.join(
   __dirname,
   `../config/custom-bootstrapped.json`
  ));

  return new Promise((resolve, reject) => {
    const spinner = new Spinner('Bootstrapping contracts...', ['⣾','⣽','⣻','⢿','⡿','⣟','⣯','⣷']);
    const child = shelljs.exec('yarn bootstrap:custom', { async: true, silent: true });
    spinner.start();

    let longest = 0;
    child.stdout?.on('data', function(data) {
      const msg = stripAnsi(data).trim();
      longest = Math.max(longest, msg.length);
      spinner.message(msg.padEnd(longest, ' '));
    });

    child.stderr?.on('data', function(data) {
      spinner.stop();
      console.log(
        "Encountered error:" + "\n" +
        chalk.red(stripAnsi(data).trim())
      );
      reject();
    });

    child.on('exit', (code) => {
      console.log(
        "\n" +
        '  ' + chalk.green('✔ Done bootstrapping contracts')
      );
      spinner.stop();
      resolve();
    });
  });
}

const cleanup = () => {
  const config = getBootstrappedConfigstore();
  config.delete("admin.secret");
}

// Main
(async () => {

  init();

  saveConfig(await askConfigQuestions());

  await bootstrapContracts();

  cleanup();

  finish();

})();
