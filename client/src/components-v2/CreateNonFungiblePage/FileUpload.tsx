import React from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Flex, Input, Heading, Text } from '@chakra-ui/react';
import { DispatchFn, State } from './reducer';

export default function FileUpload({
  state,
  dispatch
}: {
  state: State;
  dispatch: DispatchFn;
}) {
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
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
        JPG, PNG, GIF, WEBP, MP4 or MP3
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
          <Text fontSize={20}>Click or drag file this area to upload</Text>
          <Text fontSize={18} color="brand.gray">
            Support for single file
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
}
