// components/ui/data-list/DataListCard.tsx
import * as React from 'react';
import { View } from 'react-native';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MenuAction, DataListMenu } from '@/components/avuny/data-list/menu';

export interface DataListCardProps {
  title: string;
  description?: string;
  actions?: MenuAction[];
  rightSlot?: React.ReactNode; // The flexible area for prices, statuses, badges, etc.
}

export function DataListCard({ title, description, actions = [], rightSlot }: DataListCardProps) {
  return (
    <Card className="border-border/50 mb-4 w-full shadow-sm">
      <CardHeader className="flex-row items-start justify-between px-4 pt-4 pb-2">
        <View className="flex-1 pr-4">
          <CardTitle
            className="text-card-foreground text-xl leading-tight font-bold"
            numberOfLines={1}>
            {title}
          </CardTitle>
        </View>

        {/* Render Menu only if actions are provided */}
        {actions.length > 0 && <DataListMenu actions={actions} />}
      </CardHeader>

      <CardContent className="flex-row items-end justify-between px-4 pb-4">
        {/* Left Column: Description */}
        <View className={`flex-1 ${rightSlot ? 'pr-6' : ''}`}>
          {description && (
            <CardDescription
              className="text-muted-foreground text-sm leading-relaxed"
              numberOfLines={2}>
              {description}
            </CardDescription>
          )}
        </View>

        {/* Right Column: Custom Slot injection */}
        {rightSlot && <View className="shrink-0 items-end">{rightSlot}</View>}
      </CardContent>
    </Card>
  );
}
