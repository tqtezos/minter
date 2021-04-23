import { delay } from "./delay";

export type DataSource<T> = {
    getItems: () => T[],
    hasMore: () => boolean,
    loadMore: (count?: number) => Promise<void>,
};

export const createDataSourceFromArrayMap = <T, TSource> (items: TSource[], loadItem: (item:TSource) => Promise<T>, options?:{defaultChunkSize?: number}): DataSource<T> => {
    const { defaultChunkSize = 12 } = options ?? {};

    const state = {
        sourceItems: [...items],
        loadedItems: [] as T[],
        isLoading: false,
    };
    const dataSource: DataSource<T> = {
        getItems: () => state.loadedItems,
        hasMore: () => state.loadedItems.length < state.sourceItems.length,
        loadMore: async (count) => {
            while( state.isLoading){
                await delay(1);
            }

            try {
                state.isLoading = true;

                const sourceSlice = state.sourceItems.slice(state.loadedItems.length, state.loadedItems.length + (count ?? defaultChunkSize));
                state.loadedItems.push(...await Promise.all(sourceSlice.map(loadItem)));

            } finally {
                state.isLoading = false;
            }
        },
    };

    return dataSource;
};
