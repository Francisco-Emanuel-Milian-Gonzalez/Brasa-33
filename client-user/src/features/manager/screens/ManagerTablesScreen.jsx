// client-user/src/features/manager/screens/ManagerTablesScreen.jsx
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { getTablesByRestaurant, updateTableStatus } from '../../../shared/api/managerApi';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import ScreenHeader from '../../../shared/components/common/ScreenHeader';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useManagerStore } from '../store/useManagerStore';

const TABLE_STATUSES = [
  { value: 'available', label: 'Disponible', color: COLORS.success },
  { value: 'occupied', label: 'Ocupada', color: COLORS.error },
  { value: 'reserved', label: 'Reservada', color: COLORS.warning },
  { value: 'maintenance', label: 'Mantenimiento', color: COLORS.secondary },
];

const statusMeta = (status) =>
  TABLE_STATUSES.find((s) => s.value === status) || { label: status, color: COLORS.secondary };

export default function ManagerTablesScreen() {
  const restaurantId = useManagerStore((s) => s.restaurantId);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadTables = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await getTablesByRestaurant(restaurantId);
      setTables(Array.isArray(data) ? data : []);
    } catch {
      setTables([]);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useFocusEffect(useCallback(() => { loadTables(); }, [loadTables]));

  const changeStatus = (table) => {
    Alert.alert(`Mesa #${table.number}`, 'Selecciona el nuevo estado', [
      ...TABLE_STATUSES.map((s) => ({
        text: s.label,
        onPress: async () => {
          try {
            await updateTableStatus(table.id, s.value);
            loadTables();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'No se pudo actualizar');
          }
        },
      })),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  if (loading && tables.length === 0) {
    return <LoadingSpinner message="Cargando mesas..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Mesas" subtitle="Gestiona el estado de cada mesa" />
      <FlatList
        data={tables}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTables} tintColor={COLORS.accent} />
        }
        renderItem={({ item }) => {
          const meta = statusMeta(item.status);
          return (
            <Pressable style={styles.gridItem} onPress={() => changeStatus(item)}>
              <Card style={styles.tableCard}>
                <MaterialIcons name="table-restaurant" size={28} color={meta.color} />
                <Text style={styles.tableNumber}>Mesa {item.number}</Text>
                <Text style={styles.capacity}>{item.capacity} personas</Text>
                <View style={[styles.badge, { backgroundColor: `${meta.color}33` }]}>
                  <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </Card>
            </Pressable>
          );
        }}
        ListEmptyComponent={<EmptyState icon="table-restaurant" title="Sin mesas registradas" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, flexGrow: 1 },
  row: { gap: SPACING.sm },
  gridItem: { flex: 1, marginBottom: SPACING.sm },
  tableCard: { alignItems: 'center', paddingVertical: SPACING.lg },
  tableNumber: { marginTop: SPACING.sm, fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text },
  capacity: { fontSize: FONT_SIZE.sm, color: COLORS.secondary },
  badge: { marginTop: SPACING.sm, paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
});
