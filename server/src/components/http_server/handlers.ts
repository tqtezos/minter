import { Express, Response } from 'express';
import IpfsClient from 'ipfs-http-client';
import url from 'url';
import { IpfsContent } from '../../generated/graphql_schema';

// TODO: Move this configuration to a JSON definition
const ipfsConfig = {
  // The URL of our IPFS API server, our Web UI uploads files to.
  apiUrl: 'http://ipfs:5001',

  // The URL of our IPFS gateway server, which can be used for fast file download
  // It is the same server as the one running IPFS API.
  gatewayUrl: 'http://127.0.0.1:8080/',

  // The URL of a public IPFS read-only gateway server. It may take time to
  // propagate information from our IPFS server to a public one.
  // It can be also used for file download but it may be very slow.
  publicGatewayUrl: 'https://ipfs.io/'
};

export function ipfsUpload(app: Express) {
  app.post('/ipfs-upload', async (req, res: Response<IpfsContent>) => {
    if (!req.files?.file?.data) {
      throw Error('No file data found');
    }

    const ipfsClient = IpfsClient(ipfsConfig.apiUrl);
    const ipfsFile = await ipfsClient.add(req.files.file.data);
    const cid = ipfsFile.cid.toString();

    return res.status(200).send({
      cid,
      size: ipfsFile.size,
      url: url.resolve(ipfsConfig.gatewayUrl, `ipfs/${cid}`),
      publicGatewayUrl: url.resolve(ipfsConfig.publicGatewayUrl, `ipfs/${cid}`)
    });
  });
}

export default function applyHandlers(app: Express) {
  ipfsUpload(app);
}
