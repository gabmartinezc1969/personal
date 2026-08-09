import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';

import { useTheme } from '@/src/theme/useTheme';
import { useStore } from '@/src/state/store';
import { IconBtn } from '@/src/components/ui';

export default function TabLayout() {
  const { colors } = useTheme();
  const { state } = useStore();
  const unread = state.notifications.some((n) => !n.read);

  const headerRight = () => (
    <View style={{ flexDirection: 'row', marginRight: 8 }}>
      <IconBtn icon="search-outline" onPress={() => router.push('/search')} />
      <View>
        <IconBtn icon={unread ? 'notifications' : 'notifications-outline'} color={unread ? colors.brand : undefined} onPress={() => router.push('/notifications')} />
      </View>
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarStyle: { backgroundColor: colors.bgElev, borderTopColor: colors.border },
        headerStyle: { backgroundColor: colors.bgElev },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: '700' },
        headerRight,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mi Día',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'sunny' : 'sunny-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Listas',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'list' : 'list-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'calendar' : 'calendar-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          title: 'Compras',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'cart' : 'cart-outline'} size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Más',
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? 'grid' : 'grid-outline'} size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
