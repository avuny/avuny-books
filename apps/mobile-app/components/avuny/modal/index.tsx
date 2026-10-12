import React, { useCallback, useEffect, useRef, forwardRef } from 'react';
import { View } from 'react-native';
import { X } from 'lucide-react-native';
import {
  BottomSheetModal,
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';

export type AppModalProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  scrollable?: boolean;
  closeOnBackdropPress?: boolean;
  showCloseButton?: boolean;
  snapPoints?: string[] | number[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  // 1. ADD STACK BEHAVIOR TYPE
  stackBehavior?: 'push' | 'switch' | 'replace';
};

export const AppModal = forwardRef<BottomSheetModal, AppModalProps>(
  (
    {
      open,
      onOpenChange,
      title,
      description,
      children,
      footer,
      scrollable = true,
      closeOnBackdropPress = true,
      showCloseButton = true,
      snapPoints = ['85%', '100%'],
      // 2. ADD TO DESTRUCTURED PROPS (default to push so it stacks automatically)
      stackBehavior = 'push',
    },
    forwardedRef
  ) => {
    const internalRef = useRef<BottomSheetModal>(null);
    const bottomSheetRef = (forwardedRef as React.RefObject<BottomSheetModal>) || internalRef;

    useEffect(() => {
      if (open === true) {
        bottomSheetRef.current?.present();
      } else if (open === false) {
        bottomSheetRef.current?.dismiss();
      }
    }, [open]);

    const handleDismiss = useCallback(() => {
      if (onOpenChange) onOpenChange(false);
    }, [onOpenChange]);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          pressBehavior={closeOnBackdropPress ? 'close' : 'none'}
          opacity={0.4}
        />
      ),
      [closeOnBackdropPress]
    );

    const renderBackground = useCallback(
      ({ style }: any) => (
        <View
          style={style}
          className="bg-card border-border overflow-hidden rounded-t-3xl border"
        />
      ),
      []
    );

    const header = (
      <View className="flex-row items-start justify-between">
        <View className="flex-1 gap-1 pr-4">
          <Text className="text-foreground text-xl font-semibold">{title}</Text>
          {description && <Text className="text-muted-foreground text-sm">{description}</Text>}
        </View>
        {showCloseButton && <Icon as={X} onPress={close} />}
      </View>
    );

    const renderHandle = useCallback(
      () => (
        <View className="items-center pt-4 pb-2">
          <View className="bg-muted h-1.5 w-12 rounded-full" />
        </View>
      ),
      []
    );

    function close() {
      bottomSheetRef.current?.dismiss();
    }

    return (
      <BottomSheetModal
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        onDismiss={handleDismiss}
        backdropComponent={renderBackdrop}
        backgroundComponent={renderBackground}
        handleComponent={renderHandle}
        keyboardBehavior="interactive"
        keyboardBlurBehavior="restore"
        // 3. PASS PROP TO BOTTOM SHEET
        stackBehavior={stackBehavior}>
        {scrollable ? (
          <BottomSheetScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 24,
              paddingBottom: 40,
              gap: 20,
            }}>
            {header}
            {children}
            {footer}
          </BottomSheetScrollView>
        ) : (
          <BottomSheetView className="gap-5 px-6 pb-10">
            {header}
            {children}
            {footer}
          </BottomSheetView>
        )}

        {/* 4. REMOVED DUPLICATE {footer} FROM HERE */}
      </BottomSheetModal>
    );
  }
);
