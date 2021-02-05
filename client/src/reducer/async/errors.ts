export enum ErrorKind {
  UknownError,
  WalletNotConnected,
  CreateAssetContractFailed,
  CreateNftFormInvalid,
  MintTokenFailed,
  TransferTokenFailed,
  GetNftAssetContractFailed,
  GetContractNftsFailed,
  GetWalletNftAssetContractsFailed
}

export interface RejectValue {
  kind: ErrorKind;
  message: string;
  errorObj?: any;
}
