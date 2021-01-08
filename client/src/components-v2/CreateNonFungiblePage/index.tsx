import React from 'react';
import { useLocation } from 'wouter';
import {
  Box,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  Textarea
} from '@chakra-ui/react';
import { Header, MinterButton } from '../common';

export default function () {
  const [, setLocation] = useLocation();
  return (
    <Flex pos="absolute" w="100%" h="100%">
      <Flex justifyContent="space-between" width="100%" flexDir="column">
        <Header
          action={
            <MinterButton
              variant="cancelAction"
              onClick={() => setLocation('/')}
            >
              Cancel
            </MinterButton>
          }
        />
        <Flex flex="1" width="100%" justifyContent="stretch">
          <Flex
            width="50%"
            flexDirection="column"
            paddingX={28}
            paddingTop={16}
          >
            <Heading size="md" paddingBottom={6}>
              What properties would you like to give your assets?
            </Heading>
            <FormControl paddingBottom={6}>
              <FormLabel fontFamily="mono">Asset Name</FormLabel>
              <Input placeholder="Input your asset name" />
            </FormControl>
            <FormControl paddingBottom={6}>
              <FormLabel fontFamily="mono" display="flex">
                Description
                <Text marginLeft={2} color="brand.lightGray">
                  (Optional)
                </Text>
              </FormLabel>
              <Textarea minHeight="150px" placeholder="Input your asset name" />
            </FormControl>
            <Box>
              <Text fontFamily="mono" fontSize="xs" paddingBottom={3}>
                IPFS HASH
              </Text>
              <Text>98u31j2kide</Text>
            </Box>
            <Divider borderColor="brand.lightBlue" opacity="1" marginY={10} />
            <Heading size="md" paddingBottom={6}>
              Create new values for your asset
            </Heading>
            <Flex align="space-between">
              <FormControl paddingBottom={6} paddingRight={2}>
                <FormLabel fontFamily="mono">Name</FormLabel>
                <Input placeholder="e.g. Country" />
              </FormControl>
              <FormControl paddingBottom={6} paddingLeft={2}>
                <FormLabel fontFamily="mono">Value</FormLabel>
                <Input placeholder="e.g. India" />
              </FormControl>
            </Flex>
          </Flex>
          <Flex
            bg="brand.brightGray"
            borderLeftWidth="1px"
            borderLeftColor="brand.lightBlue"
            width="50%"
            flexDirection="column"
            paddingX={28}
            paddingTop={16}
          >
            (Preview WIP)
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  );
}
