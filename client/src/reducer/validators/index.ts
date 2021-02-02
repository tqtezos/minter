import Joi from 'joi';

export const fileUploadSchema = Joi.object({
  artifactUri: Joi.string().required()
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
