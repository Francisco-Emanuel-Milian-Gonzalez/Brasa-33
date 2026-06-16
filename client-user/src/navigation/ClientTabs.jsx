// client-user/src/navigation/ClientTabs.jsx
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ProfileScreen from '../features/profile/screens/ProfileScreen';
import RestaurantsScreen from '../features/restaurants/screens/RestaurantsScreen';
import RestaurantDetailScreen from '../features/restaurants/screens/RestaurantDetailScreen';
import DishDetailScreen from '../features/restaurants/screens/DishDetailScreen';
import OrdersScreen from '../features/orders/screens/OrdersScreen';
import CreateOrderScreen from '../features/orders/screens/CreateOrderScreen';
import OrderDetailScreen from '../features/orders/screens/OrderDetailScreen';
import ReservationsScreen from '../features/reservations/screens/ReservationsScreen';
import CreateReservationScreen from '../features/reservations/screens/CreateReservationScreen';
import EditReservationScreen from '../features/reservations/screens/EditReservationScreen';
import { COLORS } from '../shared/constants/theme';

const Tab = createBottomTabNavigator();
const RestaurantsStackNav = createNativeStackNavigator();
const OrdersStackNav = createNativeStackNavigator();
const ReservationsStackNav = createNativeStackNavigator();

const detailHeaderOptions = {
  headerStyle: { backgroundColor: COLORS.surface },
  headerTintColor: COLORS.text,
  headerTitleStyle: { fontWeight: '600' },
};

function RestaurantsStack() {
  return (
    <RestaurantsStackNav.Navigator screenOptions={detailHeaderOptions}>
      <RestaurantsStackNav.Screen
        name="RestaurantsList"
        component={RestaurantsScreen}
        options={{ headerShown: false }}
      />
      <RestaurantsStackNav.Screen
        name="RestaurantDetail"
        component={RestaurantDetailScreen}
        options={{ title: 'Restaurante' }}
      />
      <RestaurantsStackNav.Screen
        name="DishDetail"
        component={DishDetailScreen}
        options={{ title: 'Platillo' }}
      />
    </RestaurantsStackNav.Navigator>
  );
}

function OrdersStack() {
  return (
    <OrdersStackNav.Navigator screenOptions={detailHeaderOptions}>
      <OrdersStackNav.Screen
        name="OrdersList"
        component={OrdersScreen}
        options={{ headerShown: false }}
      />
      <OrdersStackNav.Screen
        name="CreateOrder"
        component={CreateOrderScreen}
        options={{ title: 'Nueva orden' }}
      />
      <OrdersStackNav.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{ title: 'Orden' }}
      />
    </OrdersStackNav.Navigator>
  );
}

function ReservationsStack() {
  return (
    <ReservationsStackNav.Navigator screenOptions={detailHeaderOptions}>
      <ReservationsStackNav.Screen
        name="ReservationsList"
        component={ReservationsScreen}
        options={{ headerShown: false }}
      />
      <ReservationsStackNav.Screen
        name="CreateReservation"
        component={CreateReservationScreen}
        options={{ title: 'Nueva reservación' }}
      />
      <ReservationsStackNav.Screen
        name="EditReservation"
        component={EditReservationScreen}
        options={{ title: 'Editar reservación' }}
      />
    </ReservationsStackNav.Navigator>
  );
}

const TAB_ICONS = {
  Restaurants: 'restaurant',
  Orders: 'receipt-long',
  Reservations: 'event-seat',
  Profile: 'person',
};

export default function ClientTabs() {
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
        name="Restaurants"
        component={RestaurantsStack}
        options={{ tabBarLabel: 'Restaurantes' }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersStack}
        options={{ tabBarLabel: 'Mis pedidos' }}
      />
      <Tab.Screen
        name="Reservations"
        component={ReservationsStack}
        options={{ tabBarLabel: 'Mis reservas' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Perfil',
          headerShown: true,
          title: 'Mi perfil',
          headerStyle: { backgroundColor: COLORS.surface },
          headerTintColor: COLORS.text,
          headerTitleStyle: { fontWeight: '600' },
        }}
      />
    </Tab.Navigator>
  );
}
