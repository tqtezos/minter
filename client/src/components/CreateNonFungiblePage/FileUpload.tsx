import axios from 'axios';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Flex, Heading, Text, Image } from '@chakra-ui/react';

import { DispatchFn, State } from './reducer';

type IpfsContent = {
  cid: string;
  size: number;
  url: string;
  publicGatewayUrl: string;
};

export default function FileUpload({
  state,
  dispatch
}: {
  state: State;
  dispatch: DispatchFn;
}) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    const response = await axios.post<IpfsContent>('/ipfs-upload', formData);

    dispatch({
      type: 'update_field',
      payload: { name: 'ipfs_hash', value: response.data.cid }
    });

    console.log('Succesfully uploaded image to IPFS Server.');
    console.log(response.data);
  }, []);

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
      <Box
        borderStyle="dashed"
        borderWidth="2px"
        borderColor="brand.lightBlue"
        borderRadius="3px"
        width="100%"
      >
        <Flex
          borderColor="white"
          borderWidth="1px"
          flexDir="column"
          align="center"
          py={10}
          bg="brand.brightGray"
          {...getRootProps()}
        >
          <Box as="input" {...getInputProps()} />
          {state.fields.ipfs_hash ? (
            <Image
              src={`http://localhost:8080/ipfs/${state.fields.ipfs_hash}`}
            />
          ) : (
            <>
              <Text fontSize={20}>
                Click or drag file to this area to upload
              </Text>
              <Text fontSize={18} color="brand.gray">
                Support for single file
              </Text>
            </>
          )}
        </Flex>
      </Box>
    </Flex>
  );
}
