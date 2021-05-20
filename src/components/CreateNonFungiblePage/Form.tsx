import React from 'react';
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
import { Plus, X } from 'react-feather';
import { MinterButton } from '../common';

import { useSelector, useDispatch } from '../../reducer';
import {
  addMetadataRow,
  deleteMetadataRow,
  updateName,
  updateDescription,
  updateAmount,
  updateMetadataRowName,
  updateMetadataRowValue
} from '../../reducer/slices/createNft';
import CollectionSelect from './CollectionSelect';

const DESCRIPTION_PLACEHOLDER =
  'e.g. “This is an exclusive japanese comic illustration. Once you purchase it you will be able to get the t-shirt”';

export default function Form() {
  const state = useSelector(s => s.createNft);
  const collections = useSelector(s => s.collections.collections);
  const collection = state.collectionAddress
    ? collections[state.collectionAddress] || null
    : null;
  const dispatch = useDispatch();
  const { name, description, amount } = state.fields;
  return (
    <>
      <CollectionSelect />
      <Heading size="md" paddingBottom={6}>
        What properties would you like to give your asset?
      </Heading>
      <FormControl paddingBottom={6}>
        <FormLabel fontFamily="mono">Asset Name</FormLabel>
        <Input
          autoFocus={true}
          placeholder="Input your asset name"
          value={name || ''}
          onChange={e => dispatch(updateName(e.target.value))}
        />
      </FormControl>
      {collection?.fungible ? (
        <FormControl paddingBottom={6}>
          <FormLabel fontFamily="mono">Number of editions</FormLabel>
          <Input
            type="number"
            placeholder="Input the amount of editions"
            value={amount || ''}
            onChange={e => {
              const amount = parseInt(e.target.value, 10);
              if (!isNaN(amount) && amount > 0 && Number.isInteger(amount)) {
                dispatch(updateAmount(amount));
              }
            }}
          />
        </FormControl>
      ) : null}
      <FormControl paddingBottom={6}>
        <FormLabel fontFamily="mono" display="flex">
          Description
          <Text marginLeft={2} color="brand.lightGray">
            (Optional)
          </Text>
        </FormLabel>
        <Textarea
          minHeight="150px"
          fontFamily="mono"
          placeholder={DESCRIPTION_PLACEHOLDER}
          value={description || ''}
          onChange={e => dispatch(updateDescription(e.target.value))}
        />
      </FormControl>
      <Divider borderColor="brand.lightBlue" opacity="1" marginY={10} />
      <Heading size="md" paddingBottom={6}>
        Add attributes to your asset
      </Heading>
      {state.attributes.map(({ name, value }, key) => {
        return (
          <Flex key={key} align="center" justify="stretch">
            <FormControl paddingBottom={6} paddingRight={2} flex="1">
              <FormLabel fontFamily="mono">Name</FormLabel>
              <Input
                placeholder="e.g. Country"
                value={name || ''}
                onChange={e =>
                  dispatch(updateMetadataRowName({ key, name: e.target.value }))
                }
              />
            </FormControl>
            <FormControl paddingBottom={6} paddingLeft={2} flex="1">
              <FormLabel fontFamily="mono">Value</FormLabel>
              <Input
                placeholder="e.g. India"
                value={value || ''}
                onChange={e =>
                  dispatch(
                    updateMetadataRowValue({ key, value: e.target.value })
                  )
                }
              />
            </FormControl>
            <Box
              color="gray.400"
              ml={4}
              mt={1}
              cursor="pointer"
              onClick={() => dispatch(deleteMetadataRow({ key }))}
              _hover={{
                color: 'brand.red'
              }}
            >
              <X size={30} />
            </Box>
          </Flex>
        );
      })}
      <MinterButton
        variant="primaryActionInverted"
        onClick={() => dispatch(addMetadataRow())}
        pl={3}
        pr={3}
        pt={2}
        pb={2}
      >
        <Box color="currentcolor">
          <Plus size={16} strokeWidth="3" />
        </Box>
        <Text ml={2}>Add field</Text>
      </MinterButton>
    </>
  );
}
