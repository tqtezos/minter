import React from 'react';
import { Divider, Heading, Flex, Text } from '@chakra-ui/react';
import { useSelector } from '../../reducer';
import { FilePreview } from './FileUpload';

export default function Preview() {
  const selectedFile = useSelector(s => s.createNft.selectedFile);
  const name = useSelector(s => s.createNft.fields.name);
  const description = useSelector(s => s.createNft.fields.description);
  return (
    <Flex
      flexDir="column"
      maxW="530px"
      bg="white"
      borderWidth="1px"
      borderColor="brand.lightBlue"
      borderRadius="2px"
      boxShadow="0px 0px 0px 4px rgba(211, 222, 245, 0.3)"
    >
      <Flex
        justify="center"
        align="center"
        width="300px"
        height="300px"
        overflow="hidden"
      >
        {selectedFile ? <FilePreview file={selectedFile} /> : null}
      </Flex>
      <Heading size="md" color={name ? 'black' : 'gray.200'} px={8} py={6}>
        {name ? name : ''}
      </Heading>
      <Divider borderColor="brand.lightBlue" opacity="1" />
      <Text
        px={8}
        py={6}
        color={description ? 'black' : 'gray.200'}
        fontFamily="mono"
      >
        {description ? description : ''}
      </Text>
      <Divider borderColor="brand.lightBlue" opacity="1" />
      {/* TODO: Render metadata in preview */}
    </Flex>
  );
}
