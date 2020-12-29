export default {
  // The URL of TzKt service that can generate cat avatar for a given string.
  // It is used to generate account pictures
  tzktAvatarUrl: 'https://services.tzkt.io/v1/avatars2/',

  ipfs: {
    // The URL of our IPFS API server, our Web UI uploads files to.
    apiUrl: 'http://localhost:5001',

    // The URL of our IPFS gateway server, which can be used for fast file download
    // It is the same server as the one running IPFS API.
    gatewayUrl: 'http://127.0.0.1:8080/',

    // The URL of a public IPFS read-only gateway server. It may take time to
    // propagate information from our IPFS server to a public one.
    // It can be also used for file download but it may be very slow.
    publicGatewayUrl: 'https://ipfs.io/'
  }
};
