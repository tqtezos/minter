import { validateKeyHash, ValidationResult } from '@taquito/utils';

export const keyHashValidator = () => ({
  validator: (_: any, address: string) => {
    switch (validateKeyHash(address)) {
      case ValidationResult.VALID:
        return Promise.resolve();
      case ValidationResult.NO_PREFIX_MATCHED:
        return Promise.reject('Invalid Prefix! Please enter a valid address');
      case ValidationResult.INVALID_LENGTH:
        return Promise.reject('Invalid Length! Please enter a valid address');
      case ValidationResult.INVALID_CHECKSUM:
        return Promise.reject('Invalid Checksum! Please enter a valid address');
    }
  }
});
