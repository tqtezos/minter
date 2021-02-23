import { Request, Response } from 'express';
import {
  PinataConfig,
  uploadFileToPinata,
  uploadImageWithThumbnailToPinata,
  uploadJSONToPinata
} from './helpers/pinata';
import {
  uploadImageWithThumbnailToIpfs,
  uploadDataToIpfs
} from './helpers/ipfs';

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
      const content = await uploadFileToPinata(pinataConfig, file.tempFilePath);
      return res.status(200).json(content);
    }
    const content = await uploadDataToIpfs(file.tempFilePath);
    return res.status(200).json(content);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'File upload failed' });
  }
}

export async function handleIpfsImageWithThumbnailUpload(
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
    const content = await uploadImageWithThumbnailToIpfs(file.tempFilePath);
    return res.status(200).json(content);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'File upload failed' });
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

    const content = await uploadDataToIpfs(JSON.stringify(req.body));
    return res.status(200).json(content);
  } catch (e) {
    return res.status(500).json({
      error: 'JSON upload failed'
    });
  }
}
