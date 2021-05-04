import React from 'react';
import { Flex, Text } from '@chakra-ui/react';
import {
    Collection
} from '../../../reducer/slices/collections';

interface CollectionTabProps extends Collection {
    selected: boolean;
    onSelect: (address: string) => void;
}

export default function CollectionTab({
    address,
    metadata,
    selected,
    onSelect
}: CollectionTabProps) {
    return (
        <Flex
            align="center"
            py={2}
            px={4}
            bg={selected ? 'gray.100' : 'white'}
            color={selected ? 'black' : 'gray.600'}
            _hover={{
                cursor: 'pointer',
                color: selected ? 'black' : 'gray.800'
            }}
            onClick={() => onSelect(address)}
            role="group"
        >
            <Flex
                align="center"
                justify="center"
                w={8}
                h={8}
                bg={selected ? 'brand.blue' : 'gray.100'}
                color={selected ? 'white' : 'gray.400'}
                borderRadius="100%"
                fontWeight="600"
                _groupHover={{
                    bg: selected ? 'brand.blue' : 'gray.200'
                }}
            >
                <Text>{metadata?.name ? metadata.name[0] : '?'}</Text>
            </Flex>
            <Text pl={4} fontWeight={selected ? '600' : '600'}>
                {metadata?.name || address}
            </Text>
        </Flex>
    );
}