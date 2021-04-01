import React from 'react';
import {
  Box,
  Heading,
  Text,
  Flex,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionIcon,
  AccordionPanel
} from '@chakra-ui/react';
import { useSelector } from '../../reducer';
import { FilePreview } from './FileUpload';

function Label(props: { children: React.ReactNode }) {
  return (
    <Text fontSize="md" fontFamily="mono" color="brand.darkGray">
      {props.children}
    </Text>
  );
}

export default function Confirmation() {
  const selectedFile = useSelector(s => s.createNft.selectedFile);
  const collections = useSelector(s => s.collections.collections);
  const fields = useSelector(s => s.createNft.fields);
  const attributes = useSelector(s => s.createNft.attributes);
  const collectionAddress = useSelector(s => s.createNft.collectionAddress);

  return (
    <Box>
      <Heading size="lg" mb={4}>
        Confirm Details
      </Heading>
      <Flex w="100%" justify="center" mb={8}>
        <FilePreview file={selectedFile!} />
      </Flex>
      <Label>Collection</Label>
      <Text fontSize="md" mb={[2, 4]}>
        {collections[collectionAddress!]?.metadata?.name}
      </Text>
      <Label>Name</Label>
      <Text fontSize="md" mb={[2, 4]}>
        {fields.name}
      </Text>
      <Label>Description</Label>
      <Text fontSize="md" mb={[2, 4]}>
        {fields.description || 'No description provided'}
      </Text>
      <Accordion allowToggle>
        <AccordionItem border="none">
          <AccordionButton mt={[4, 8]} p={0}>
            <Text color="brand.neutralGray">Metadata</Text>
            <AccordionIcon />
          </AccordionButton>
          <AccordionPanel pb={4}>
            {attributes?.map(({ name, value }) => (
              <Flex mt={[4, 8]}>
                <Text color="brand.neutralGray">{name}:</Text>
                <Text color="brand.darkGray" fontWeight="bold" ml={[1]}>
                  {value}
                </Text>
              </Flex>
            ))}
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
}
