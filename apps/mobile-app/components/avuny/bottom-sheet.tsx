import React, { useCallback, useMemo, useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetFlatList,
  BottomSheetTextInput,
  BottomSheetBackdrop,
} from '@gorhom/bottom-sheet';
import { Check, ChevronDown, Search } from 'lucide-react-native';
import { Text } from '@/components/ui/text';
import { useUniwind } from 'uniwind';

export interface ComboboxOption {
  id: string;
  name: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value?: string;
  onSelect: (id: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  variant?: 'default' | 'ghost'; // <-- Added variant prop
}

export const Combobox = ({
  options,
  value,
  onSelect,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  variant = 'default',
}: ComboboxProps) => {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

  const bottomSheetModalRef = useRef<BottomSheetModal>(null);
  const snapPoints = useMemo(() => ['50%', '80%'], []);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedOption = useMemo(() => options.find((opt) => opt.id === value), [options, value]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((opt) => opt.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  const handleOpen = useCallback(() => {
    bottomSheetModalRef.current?.present();
  }, []);

  const handleSelect = useCallback(
    (id: string) => {
      onSelect(id);
      bottomSheetModalRef.current?.dismiss();
      setSearchQuery('');
    },
    [onSelect]
  );

  const renderBackdrop = useCallback(
    (props: any) => <BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />,
    []
  );

  const isGhost = variant === 'ghost';

  return (
    // If ghost, don't use full width so it hugs the header contents
    <View className={isGhost ? '' : 'w-full'}>
      {/* TRIGGER BUTTON */}
      <Pressable
        onPress={handleOpen}
        className={
          isGhost
            ? 'flex-row items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 active:opacity-70 dark:bg-zinc-800' // Compact pill shape for headers
            : 'flex-row items-center justify-between rounded-md border border-gray-300 bg-white px-4 py-3 active:opacity-70 dark:border-gray-700 dark:bg-zinc-900'
        }>
        <Text
          className={
            isGhost
              ? 'text-sm font-medium text-black dark:text-white'
              : `text-base ${selectedOption ? 'text-black dark:text-white' : 'text-gray-500'}`
          }>
          {selectedOption ? selectedOption.name : placeholder}
        </Text>
        <ChevronDown size={isGhost ? 16 : 20} color={isDark ? '#a1a1aa' : '#52525b'} />
      </Pressable>

      {/* BOTTOM SHEET MODAL */}
      <BottomSheetModal
        ref={bottomSheetModalRef}
        name="combobox-modal"
        index={0}
        snapPoints={snapPoints}
        backdropComponent={renderBackdrop}
        backgroundStyle={{ backgroundColor: isDark ? '#18181b' : '#ffffff' }}
        handleIndicatorStyle={{ backgroundColor: isDark ? '#52525b' : '#d4d4d8' }}>
        <View className="flex-1 px-4 pb-4">
          <View className="mb-4 flex-row items-center rounded-md bg-gray-100 px-3 py-2 dark:bg-zinc-800">
            <Search size={18} color={isDark ? '#a1a1aa' : '#52525b'} />
            <BottomSheetTextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={searchPlaceholder}
              placeholderTextColor={isDark ? '#a1a1aa' : '#a1a1aa'}
              className="ml-2 flex-1 text-black dark:text-white"
              style={{ padding: 0 }}
            />
          </View>

          <BottomSheetFlatList
            data={filteredOptions}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 80 }}
            renderItem={({ item }) => {
              const isSelected = item.id === value;
              return (
                <Pressable
                  onPress={() => handleSelect(item.id)}
                  className="flex-row items-center justify-between rounded-md px-2 py-3 active:bg-gray-100 dark:active:bg-zinc-800">
                  <Text
                    className={`text-base ${isSelected ? 'font-semibold text-black dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                    {item.name}
                  </Text>
                  {isSelected && <Check size={20} color={isDark ? '#ffffff' : '#000000'} />}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text className="mt-4 text-center text-gray-500">No results found.</Text>
            }
          />
        </View>
      </BottomSheetModal>
    </View>
  );
};
