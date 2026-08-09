import { Tabs, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Platform, ColorValue } from 'react-native';

import { useTheme } from '@/src/theme/useTheme';
import { useStore } from '@/src/state/store';
import { FONTS } from '@/src/theme/fonts';
import { IconBtn } from '@/src/components/ui';

export default function TabLayout() {
  const { colors } = useTheme();
  const { state } = useStore();
  const unread = state.notifications.some((n) => !n.read);

  const headerRight = () => (
    <View style={{ flexDirection: 'row', marginRight: 6 }}>
      <IconBtn icon="search-outline" onPress={() => router.push('/search')} />
      <IconBtn icon={unread ? 'notifications' : 'notifications-outline'} color={unread ? colors.brand : undefined} onPress={() => router.push('/notifications')} />
    </View>
  );

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.brand,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontFamily: FONTS.bold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.bgElev,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingTop: 8,
        },
        headerStyle: { backgroundColor: colors.bg },
        headerTintColor: colors.text,
        headerTitleStyle: { fontFamily: FONTS.extra, fontSize: 18 },
        headerShadowVisible: false,
        headerRight,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mi Día',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'sunny' : 'sunny-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: 'Listas',
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'list' : 'list-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: 'Calendario',
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'calendar' : 'calendar-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="grocery"
        options={{
          title: 'Compras',
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'cart' : 'cart-outline'} color={color} focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'Más',
          tabBarIcon: ({ color, focused }) => <TabIcon name={focused ? 'grid' : 'grid-outline'} color={color} focused={focused} />,
        }}
      />
    </Tabs>
  );
}

function TabIcon({ name, color, focused }: { name: keyof typeof Ionicons.glyphMap; color: ColorValue; focused: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        width: 40,
        height: 30,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? colors.brandDim : 'transparent',
      }}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}
