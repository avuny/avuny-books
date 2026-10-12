import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { MobileDataList } from '@/components/avuny/data-list';
import { DataListCard } from '@/components/avuny/data-list/card';
import { Badge } from '@/components/ui/badge';
import { Text } from '@/components/ui/text';
import { Edit2, Trash2 } from 'lucide-react-native';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  quantity: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  date: string;
}

const DUMMY_INVENTORY_DATA: InventoryItem[] = [
  {
    id: 'INV-1001',
    name: 'Industrial Widget A',
    sku: 'WID-001',
    category: 'Hardware',
    quantity: 142,
    status: 'in_stock',
    date: '22 Jul 2026',
  },
  {
    id: 'INV-1002',
    name: 'Precision Gear Shaft',
    sku: 'GEAR-042',
    category: 'Mechanical',
    quantity: 12,
    status: 'low_stock',
    date: '21 Jul 2026',
  },
  {
    id: 'INV-1003',
    name: 'High-Torque Electric Motor',
    sku: 'MOT-900',
    category: 'Electrical',
    quantity: 0,
    status: 'out_of_stock',
    date: '20 Jul 2026',
  },
  {
    id: 'INV-1004',
    name: 'Hydraulic Seal Ring',
    sku: 'SEAL-110',
    category: 'Hydraulics',
    quantity: 350,
    status: 'in_stock',
    date: '19 Jul 2026',
  },
  {
    id: 'INV-1005',
    name: 'Thermal Sensor Probe',
    sku: 'SENS-204',
    category: 'Electronics',
    quantity: 8,
    status: 'low_stock',
    date: '18 Jul 2026',
  },
  {
    id: 'INV-1006',
    name: 'Heavy Duty Bearings 6204',
    sku: 'BRG-6204',
    category: 'Mechanical',
    quantity: 85,
    status: 'in_stock',
    date: '17 Jul 2026',
  },
];

const FILTER_OPTIONS = [
  { label: 'All Items', value: 'all' },
  { label: 'In Stock', value: 'in_stock' },
  { label: 'Low Stock', value: 'low_stock' },
  { label: 'Out of Stock', value: 'out_of_stock' },
];

export default function InventoryScreen() {
  const [items, setItems] = useState<InventoryItem[]>(DUMMY_INVENTORY_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'all' || item.status === activeFilter;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: InventoryItem['status']) => {
    switch (status) {
      case 'in_stock':
        return <Badge className="bg-emerald-600 rounded-full px-2 py-0.5"><Text className="text-xs text-white">In Stock</Text></Badge>;
      case 'low_stock':
        return <Badge className="bg-amber-500 rounded-full px-2 py-0.5"><Text className="text-xs text-white">Low Stock</Text></Badge>;
      case 'out_of_stock':
        return <Badge variant="destructive" className="rounded-full px-2 py-0.5"><Text className="text-xs">Out of Stock</Text></Badge>;
    }
  };

  const renderItem = ({ item }: { item: InventoryItem }) => {
    const actions = [
      {
        id: 'edit',
        label: 'Edit Item',
        icon: Edit2,
        onPress: () => Alert.alert('Edit Item', `Editing ${item.name}`),
      },
      {
        id: 'delete',
        label: 'Delete Item',
        icon: Trash2,
        isDestructive: true,
        onPress: () => setItems((prev) => prev.filter((i) => i.id !== item.id)),
      },
    ];

    return (
      <View className="px-4 pt-2">
        <DataListCard
          title={item.name}
          description={`SKU: ${item.sku} • Qty: ${item.quantity}`}
          actions={actions}
          rightSlot={getStatusBadge(item.status)}
        />
      </View>
    );
  };

  return (
    <View className="bg-background flex-1">
      <MobileDataList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        isLoading={false}
        showSearch
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search inventory by name or SKU..."
        filterOptions={FILTER_OPTIONS}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        onAddClick={() => Alert.alert('Add Item', 'Open add item modal')}
        emptyTitle="No inventory items found"
        emptyDescription="Try adjusting your search query or filter."
        refetch={async () => {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }}
      />
    </View>
  );
}
