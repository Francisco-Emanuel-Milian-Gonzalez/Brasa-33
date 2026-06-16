// client-user/src/navigation/ManagerTabs.jsx
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ManagerRestaurantGuard from '../features/manager/components/ManagerRestaurantGuard';
import ManagerInventoryScreen from '../features/manager/screens/ManagerInventoryScreen';
import ManagerMenuScreen from '../features/manager/screens/ManagerMenuScreen';
import ManagerMoreScreen from '../features/manager/screens/ManagerMoreScreen';
import ManagerOrdersScreen from '../features/manager/screens/ManagerOrdersScreen';
import ManagerReportsScreen from '../features/manager/screens/ManagerReportsScreen';
import ManagerReservationsScreen from '../features/manager/screens/ManagerReservationsScreen';
import ManagerTablesScreen from '../features/manager/screens/ManagerTablesScreen';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import { COLORS } from '../shared/constants/theme';

const Tab = createBottomTabNavigator();
const MoreStackNav = createNativeStackNavigator();

const headerOptions = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: '600' },
};

function MoreStack() {
  return (
    <MoreStackNav.Navigator screenOptions={headerOptions}>
      <MoreStackNav.Screen
        name="MoreMenu"
        component={ManagerMoreScreen}
        options={{ headerShown: false }}
      />
      <MoreStackNav.Screen
        name="Inventory"
        component={ManagerInventoryScreen}
        options={{ title: 'Inventario' }}
      />
      <MoreStackNav.Screen
        name="Reports"
        component={ManagerReportsScreen}
        options={{ title: 'Reportes' }}
      />
      <MoreStackNav.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Mi perfil' }}
      />
    </MoreStackNav.Navigator>
  );
}

const TAB_ICONS = {
  Monitor: 'schedule',
  Tables: 'table-restaurant',
  Menu: 'restaurant-menu',
  Reservations: 'event-seat',
  More: 'more-horiz',
};

function ManagerTabsContent() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.accent,
        tabBarInactiveTintColor: COLORS.secondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          height: 60,
          borderTopWidth: 1,
          borderTopColor: COLORS.border,
        },
        tabBarIcon: ({ color, size }) => (
          <MaterialIcons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen
        name="Monitor"
        component={ManagerOrdersScreen}
        options={{ tabBarLabel: 'Pedidos' }}
      />
      <Tab.Screen
        name="Tables"
        component={ManagerTablesScreen}
        options={{ tabBarLabel: 'Mesas' }}
      />
      <Tab.Screen
        name="Menu"
        component={ManagerMenuScreen}
        options={{ tabBarLabel: 'Menú' }}
      />
      <Tab.Screen
        name="Reservations"
        component={ManagerReservationsScreen}
        options={{ tabBarLabel: 'Reservas' }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{ tabBarLabel: 'Más' }}
      />
    </Tab.Navigator>
  );
}

export default function ManagerTabs() {
  return (
    <ManagerRestaurantGuard>
      <ManagerTabsContent />
    </ManagerRestaurantGuard>
  );
}
