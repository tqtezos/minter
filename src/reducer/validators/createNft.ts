import Joi from 'joi';
import { State } from '..';

export const fileUploadSchema = Joi.object({
  selectedFile: Joi.required().invalid(null)
});

export const assetDetailsSchema = fileUploadSchema.append({
  fields: Joi.object({
    name: Joi.string().min(1).required(),
    description: Joi.string().allow(null).allow('')
  }),
  metadataRows: Joi.array().items(
    Joi.object({
      name: Joi.string().min(1).required(),
      value: Joi.string().min(1).required()
    })
  )
});

export const collectionSelectSchema = assetDetailsSchema.append({
  collectionAddress: Joi.string().required()
});

function isValid(schema: Joi.ObjectSchema, object: any) {
  return !schema.validate(object, { allowUnknown: true }).error;
}

export function validateCreateNftStep(state: State['createNft']) {
  switch (state.step) {
    case 'file_upload':
      return isValid(fileUploadSchema, state);
    case 'asset_details':
      return isValid(collectionSelectSchema, state);
    case 'collection_select':
      return isValid(collectionSelectSchema, state);
    case 'confirm':
      return isValid(collectionSelectSchema, state);
    default:
      return false;
  }
}

export function validateCreateNftForm(state: State['createNft']) {
  return isValid(collectionSelectSchema, state);
}
