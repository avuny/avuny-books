import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { FlashList, FlashListRef, ListRenderItem } from '@shopify/flash-list';
import { Search, Filter, Plus, X } from 'lucide-react-native';

import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';

export interface FilterOption {
  label: string;
  value: string;
}

export interface MobileDataListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  estimatedItemSize?: number;
  renderSkeleton?: () => React.ReactElement;

  fetchNextPage?: () => void;
  isFetchingNextPage?: boolean;
  hasNextPage?: boolean;
  refetch?: () => Promise<void>;

  onAddClick?: () => void;

  showSearch?: boolean;
  searchQuery?: string;
  onSearchChange?: (text: string) => void;
  searchPlaceholder?: string;

  filterOptions?: FilterOption[];
  activeFilter?: string;
  onFilterChange?: (value: string) => void;
  onFilterMenuClick?: () => void;

  emptyTitle?: string;
  emptyDescription?: string;
}

const DefaultSkeleton = () => (
  <Card className="border-border bg-card mx-4 my-2 rounded-xl p-4 shadow-sm">
    <View className="mb-4 flex-row justify-between">
      <View className="gap-2">
        <View className="bg-muted h-5 w-32 animate-pulse rounded-md" />
        <View className="bg-muted h-4 w-24 animate-pulse rounded-md" />
      </View>
      <View className="bg-muted h-6 w-16 animate-pulse rounded-full" />
    </View>
    <View className="bg-muted mt-2 h-4 w-20 animate-pulse rounded-md" />
  </Card>
);

export function MobileDataList<T>({
  data,
  renderItem,
  keyExtractor,
  isLoading = false,
  estimatedItemSize = 120,
  renderSkeleton,
  fetchNextPage,
  isFetchingNextPage = false,
  hasNextPage = false,
  refetch,
  onAddClick,
  showSearch = false,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  filterOptions = [],
  activeFilter = '',
  onFilterChange,
  onFilterMenuClick,
  emptyTitle = 'No results found',
  emptyDescription = 'No items match your criteria.',
}: MobileDataListProps<T>) {
  const [refreshing, setRefreshing] = useState(false);

  const listRef = useRef<FlashListRef<T>>(null);
  const prevDataLength = useRef(data.length);

  useEffect(() => {
    if (data.length > prevDataLength.current && !isFetchingNextPage && !isLoading) {
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    }
    prevDataLength.current = data.length;
  }, [data.length, isFetchingNextPage, isLoading]);

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [searchQuery, activeFilter]);

  const handleRefresh = async () => {
    if (!refetch) return;
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const hasStickyHeader = showSearch || filterOptions.length > 0;
  // Fallback for placeholder styling in React Native since Nativewind `placeholder:text-*` can be finicky

  return (
    <View className="bg-background relative flex-1">
      {hasStickyHeader && (
        <View className="bg-background border-border z-10 border-b pt-2 pb-3 shadow-sm">
          {(showSearch || onFilterMenuClick) && (
            <View className="mb-3 flex-row items-center gap-2 px-4">
              {showSearch && (
                <View className="bg-muted/50 border-border flex-1 flex-row items-center rounded-xl border px-3 py-2">
                  <Icon as={Search} size={18} className="text-muted-foreground mr-2" />
                  <TextInput
                    className="text-foreground h-8 flex-1 text-base"
                    placeholder={searchPlaceholder}
                    value={searchQuery}
                    onChangeText={onSearchChange}
                  />
                  {searchQuery.length > 0 && onSearchChange && (
                    <Pressable onPress={() => onSearchChange('')} className="p-1 active:opacity-70">
                      <Icon as={X} size={16} className="text-muted-foreground" />
                    </Pressable>
                  )}
                </View>
              )}

              {onFilterMenuClick && (
                <Pressable
                  onPress={onFilterMenuClick}
                  className="bg-muted/50 border-border h-12 w-12 items-center justify-center rounded-xl border active:opacity-70">
                  <Icon as={Filter} size={20} className="text-foreground" />
                </Pressable>
              )}
            </View>
          )}

          {filterOptions.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 16, gap: 10 }}>
              {filterOptions.map((filter) => {
                const isActive = activeFilter === filter.value;
                return (
                  <Pressable
                    key={filter.value}
                    onPress={() => onFilterChange?.(filter.value)}
                    className={cn(
                      'rounded-full border px-5 py-2 transition-colors active:opacity-80',
                      isActive ? 'bg-primary border-primary' : 'bg-secondary border-transparent'
                    )}>
                    <Text
                      className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-primary-foreground' : 'text-secondary-foreground'
                      )}>
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      {isLoading && !data?.length ? (
        <View className="flex-1 pt-4">
          {[1, 2, 3, 4, 5].map((key) => (
            <React.Fragment key={key}>
              {renderSkeleton ? renderSkeleton() : <DefaultSkeleton />}
            </React.Fragment>
          ))}
        </View>
      ) : (
        <FlashList
          ref={listRef}
          data={data}
          extraData={data}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          contentContainerStyle={{ paddingBottom: 100, paddingTop: 8 }}
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
              fetchNextPage();
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="items-center justify-center py-6">
                <ActivityIndicator size="small" />
              </View>
            ) : null
          }
          refreshControl={
            refetch ? (
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            ) : undefined
          }
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center gap-3 px-6 pt-20">
              <View className="bg-muted mb-2 h-16 w-16 items-center justify-center rounded-full">
                <Icon as={Search} size={28} className="text-muted-foreground" />
              </View>
              <Text className="text-foreground text-center text-lg font-semibold">
                {emptyTitle}
              </Text>
              <Text className="text-muted-foreground text-center text-sm">{emptyDescription}</Text>
            </View>
          }
        />
      )}

      {onAddClick && (
        <Pressable
          onPress={onAddClick}
          className="bg-primary absolute right-6 bottom-8 z-50 h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all active:scale-95 active:opacity-90">
          <Icon as={Plus} size={24} className="text-primary-foreground" />
        </Pressable>
      )}
    </View>
  );
}
