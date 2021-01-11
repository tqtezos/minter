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
import { DispatchFn, State } from './reducer';

const DESCRIPTION_PLACEHOLDER =
  'e.g. “This is an exclusive japanese comic illustration. Once you purchase it you will be able to get the t-shirt”';

export default function Form({
  dispatch,
  state
}: {
  dispatch: DispatchFn;
  state: State;
}) {
  const { name, description } = state.fields;
  return (
    <>
      <Heading size="md" paddingBottom={6}>
        What properties would you like to give your assets?
      </Heading>
      <FormControl paddingBottom={6}>
        <FormLabel fontFamily="mono">Asset Name</FormLabel>
        <Input
          autoFocus={true}
          placeholder="Input your asset name"
          value={name || ''}
          onChange={e =>
            dispatch({
              type: 'update_field',
              payload: { name: 'name', value: e.target.value }
            })
          }
        />
      </FormControl>
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
          onChange={e =>
            dispatch({
              type: 'update_field',
              payload: { name: 'description', value: e.target.value }
            })
          }
        />
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
      {state.metadataRows.map(({ name, value }, i) => {
        return (
          <Flex key={i} align="center" justify="stretch">
            <FormControl paddingBottom={6} paddingRight={2} flex="1">
              <FormLabel fontFamily="mono">Name</FormLabel>
              <Input
                placeholder="e.g. Country"
                value={name || ''}
                onChange={e =>
                  dispatch({
                    type: 'update_metadata_row_name',
                    payload: { key: i, name: e.target.value }
                  })
                }
              />
            </FormControl>
            <FormControl paddingBottom={6} paddingLeft={2} flex="1">
              <FormLabel fontFamily="mono">Value</FormLabel>
              <Input
                placeholder="e.g. India"
                value={value || ''}
                onChange={e =>
                  dispatch({
                    type: 'update_metadata_row_value',
                    payload: { key: i, value: e.target.value }
                  })
                }
              />
            </FormControl>
            <Flex
              h={6}
              w={6}
              color="brand.red"
              justify="center"
              align="center"
              borderRadius="50%"
              borderWidth="1px"
              borderColor="brand.red"
              fontSize="xs"
              fontWeight="600"
              ml={3}
              mt={1}
              cursor="pointer"
              onClick={() =>
                dispatch({ type: 'delete_metadata_row', payload: { key: i } })
              }
            >
              X
            </Flex>
          </Flex>
        );
      })}
      <Text
        textDecor="underline"
        color="brand.blue"
        cursor="pointer"
        onClick={() => dispatch({ type: 'add_metadata_row' })}
      >
        + Add new field
      </Text>
    </>
  );
}
