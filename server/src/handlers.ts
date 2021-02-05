import { Request, Response } from 'express';
import {
  PinataConfig,
  uploadImageWithThumbnailToPinata,
  uploadJSONToPinata
} from './helpers/pinata';
import { uploadDataToIpfs } from './helpers/ipfs';
import fs from 'fs';

export async function handleIpfsFileUpload(
  pinataConfig: PinataConfig | null,
  req: Request,
  res: Response
) {
  const file = req.files?.file;
  if (!file?.data) {
    return res.status(500).json({
      error: 'No file data found'
    });
  }

  try {
    if (pinataConfig) {
      const content = await uploadImageWithThumbnailToPinata(
        pinataConfig,
        file.tempFilePath
      );
      return res.status(200).json(content);
    }
    const data = fs.readFileSync(file.tempFilePath);
    const content = await uploadDataToIpfs(data);
    return res.status(200).json(content);
  } catch (e) {
    return res.status(500).json({
      error: 'File upload failed'
    });
  }
}

export async function handleIpfsJSONUpload(
  pinataConfig: PinataConfig | null,
  req: Request,
  res: Response
) {
  if (req.body === undefined) {
    return res.status(500).json({
      error: 'Could not retrieve JSON request body'
    });
  }

  try {
    if (pinataConfig) {
      const content = await uploadJSONToPinata(pinataConfig, req.body);
      return res.status(200).json(content);
    }

    const content = await uploadDataToIpfs(req.body);
    return res.status(200).json(content);
  } catch (e) {
    return res.status(500).json({
      error: 'JSON upload failed'
    });
  }
}
