export enum ErrorKind {
  UknownError,
  WalletNotConnected,
  CreateAssetContractFailed,
  CreateNftFormInvalid,
  MintTokenFailed,
  TransferTokenFailed,
  ListTokenFailed,
  CancelTokenSaleFailed,
  BuyTokenFailed,
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
