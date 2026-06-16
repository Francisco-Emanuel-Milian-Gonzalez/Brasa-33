// client-user/src/features/manager/screens/ManagerMenuScreen.jsx
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  deleteDish,
  getDishesByRestaurant,
  updateDishStock,
} from '../../../shared/api/managerApi';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import ScreenHeader from '../../../shared/components/common/ScreenHeader';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { formatPrice } from '../../../shared/utils/formatters';
import { useManagerStore } from '../store/useManagerStore';

export default function ManagerMenuScreen() {
  const restaurantId = useManagerStore((s) => s.restaurantId);
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadDishes = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await getDishesByRestaurant(restaurantId);
      setDishes(Array.isArray(data) ? data : []);
    } catch {
      setDishes([]);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useFocusEffect(useCallback(() => { loadDishes(); }, [loadDishes]));

  const adjustStock = async (dish, delta) => {
    const next = Math.max(0, Number(dish.stock) + delta);
    try {
      await updateDishStock(dish.id, next);
      loadDishes();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo actualizar el stock');
    }
  };

  const handleDelete = (dish) => {
    Alert.alert('Eliminar plato', `¿Eliminar "${dish.name}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDish(dish.id);
            loadDishes();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'No se pudo eliminar');
          }
        },
      },
    ]);
  };

  if (loading && dishes.length === 0) {
    return <LoadingSpinner message="Cargando menú..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Menú" subtitle="Administra platos y existencias" />
      <FlatList
        data={dishes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDishes} tintColor={COLORS.accent} />
        }
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <View style={styles.row}>
              {item.image_url ? (
                <Image source={{ uri: item.image_url }} style={styles.image} />
              ) : (
                <View style={styles.imageFallback}>
                  <MaterialIcons name="restaurant-menu" size={24} color={COLORS.accent} />
                </View>
              )}
              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{item.name}</Text>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
                <Text style={styles.stock}>Stock: {item.stock}</Text>
              </View>
            </View>
            <View style={styles.actions}>
              <Pressable style={styles.stockBtn} onPress={() => adjustStock(item, -1)}>
                <MaterialIcons name="remove" size={18} color={COLORS.accent} />
              </Pressable>
              <Pressable style={styles.stockBtn} onPress={() => adjustStock(item, 1)}>
                <MaterialIcons name="add" size={18} color={COLORS.accent} />
              </Pressable>
              <Pressable style={styles.deleteBtn} onPress={() => handleDelete(item)}>
                <MaterialIcons name="delete" size={18} color={COLORS.error} />
              </Pressable>
            </View>
          </Card>
        )}
        ListEmptyComponent={<EmptyState icon="restaurant-menu" title="Sin platos en el menú" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, flexGrow: 1 },
  card: { marginBottom: SPACING.sm },
  row: { flexDirection: 'row', gap: SPACING.sm },
  image: { width: 56, height: 56, borderRadius: 12 },
  imageFallback: {
    width: 56, height: 56, borderRadius: 12, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.background, borderWidth: 1, borderColor: COLORS.border,
  },
  info: { flex: 1 },
  name: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  price: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.accent },
  stock: { fontSize: FONT_SIZE.xs, color: COLORS.secondary },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.sm, justifyContent: 'flex-end' },
  stockBtn: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 1, borderColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
  },
  deleteBtn: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
});
