// client-user/src/features/manager/screens/ManagerInventoryScreen.jsx
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { getInventory } from '../../../shared/api/managerApi';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import ScreenHeader from '../../../shared/components/common/ScreenHeader';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';

export default function ManagerInventoryScreen() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getInventory();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadInventory(); }, [loadInventory]));

  if (loading && items.length === 0) {
    return <LoadingSpinner message="Cargando inventario..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Inventario" subtitle="Ingredientes y existencias" />
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadInventory} tintColor={COLORS.accent} />
        }
        renderItem={({ item }) => {
          const lowStock = Number(item.quantity) <= Number(item.min_stock);
          return (
            <Card style={styles.card}>
              <View style={styles.row}>
                <MaterialIcons
                  name="inventory"
                  size={24}
                  color={lowStock ? COLORS.error : COLORS.accent}
                />
                <View style={styles.info}>
                  <Text style={styles.name}>{item.ingredient}</Text>
                  <Text style={styles.qty}>
                    {item.quantity} {item.unit}
                    {item.min_stock != null ? ` · mín. ${item.min_stock}` : ''}
                  </Text>
                </View>
                {lowStock ? (
                  <View style={styles.lowBadge}>
                    <Text style={styles.lowText}>Bajo</Text>
                  </View>
                ) : null}
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={<EmptyState icon="inventory" title="Sin items en inventario" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, flexGrow: 1 },
  card: { marginBottom: SPACING.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  info: { flex: 1 },
  name: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  qty: { fontSize: FONT_SIZE.sm, color: COLORS.secondary },
  lowBadge: {
    backgroundColor: `${COLORS.error}33`,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  lowText: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.error },
});
