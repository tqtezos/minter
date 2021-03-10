import { Request, Response } from 'express';
import fs from 'fs';
import { IpfsProvider } from './providers/ipfs';

export async function handleIpfsFileUpload(
  ipfsProvider: IpfsProvider,
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
    const content = await ipfsProvider.uploadFile(file.tempFilePath);
    return res.status(200).json(content);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'File upload failed' });
  }
}

export async function handleIpfsImageWithThumbnailUpload(
  ipfsProvider: IpfsProvider,
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
    const content = await ipfsProvider.uploadImageWithThumbnail(file.tempFilePath);
    return res.status(200).json(content);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: 'File upload failed' });
  }
}

export async function handleIpfsJSONUpload(
  ipfsProvider: IpfsProvider,
  req: Request,
  res: Response
) {
  if (req.body === undefined) {
    return res.status(500).json({
      error: 'Could not retrieve JSON request body'
    });
  }

  try {
    const content = await ipfsProvider.uploadJSON(req.body);
    return res.status(200).json(content);
  } catch (e) {
    return res.status(500).json({
      error: 'JSON upload failed'
    });
  }
}
