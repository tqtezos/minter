import axios from 'axios';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Flex, Heading, Text, Image } from '@chakra-ui/react';
import { useSelector, useDispatch } from '../../reducer';
import { updateArtifactUri } from '../../reducer/slices/createNft';
import { ipfsUriToGatewayUrl } from '../../util';

type IpfsContent = {
  cid: string;
  size: number;
  ipfsUri: string;
  url: string;
  publicGatewayUrl: string;
};

export default function FileUpload() {
  const state = useSelector(s => s.createNft);
  const dispatch = useDispatch();

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const formData = new FormData();
      formData.append('file', acceptedFiles[0]);

      const response = await axios.post<IpfsContent>(
        '/ipfs-file-upload',
        formData
      );
      dispatch(updateArtifactUri(response.data.ipfsUri));
    },
    [dispatch]
  );

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 30 * 1024 * 1024,
    accept: 'image/*'
  });

  return (
    <Flex align="center" flexDir="column" width="100%" flex="1" pt={28}>
      <Heading size="lg" paddingBottom={8} textAlign="center">
        Upload your file
      </Heading>
      <Text
        fontSize="xs"
        color="brand.blue"
        fontFamily="mono"
        textAlign="center"
        pb={4}
      >
        JPG, PNG, GIF, WEBP, SVG. Max size 30mb
      </Text>
      <Flex
        borderStyle="dashed"
        borderWidth="2px"
        borderColor="brand.lightBlue"
        borderRadius="3px"
        width="100%"
        justify="center"
        align="center"
        {...getRootProps()}
      >
        <Box as="input" {...getInputProps()} />
        {state.artifactUri ? (
          <Image
            p={4}
            maxWidth="400px"
            maxHeight="400px"
            src={ipfsUriToGatewayUrl(state.artifactUri)}
          />
        ) : (
          <Flex
            borderColor="white"
            borderWidth="1px"
            flexDir="column"
            align="center"
            py={10}
            bg="brand.brightGray"
            flex="1"
          >
            <Text fontSize={20}>Click or drag file to this area to upload</Text>
            <Text fontSize={18} color="brand.gray">
              Support for single file
            </Text>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
}
