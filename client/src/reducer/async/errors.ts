export enum ErrorKind {
  UknownError,
  WalletNotConnected,
  CreateAssetContractFailed,
  CreateNftFormInvalid,
  MintTokenFailed,
  TransferTokenFailed,
  GetNftAssetContractFailed,
  GetContractNftsFailed,
  GetWalletNftAssetContractsFailed,
  IPFSUploadFailed,
  WalletAlreadyConnected,
  WalletPermissionRequestDenied
}

export interface RejectValue {
  kind: ErrorKind;
  message: string;
  errorObj?: any;
}
