// client-user/src/features/manager/screens/ManagerOrdersScreen.jsx
import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { StatusKpiChip } from '../../../shared/components/common/StatusKpiChip';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  generateInvoice,
  getInvoiceByOrder,
  getOrdersByRestaurant,
  updateOrderStatus,
} from '../../../shared/api/managerApi';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import ScreenHeader from '../../../shared/components/common/ScreenHeader';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { formatDate, formatPrice } from '../../../shared/utils/formatters';
import { useManagerStore } from '../store/useManagerStore';

const POLL_MS = 20000;

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pendiente', color: '#F5A623' },
  { value: 'confirmed', label: 'Confirmado', color: '#3b82f6' },
  { value: 'preparing', label: 'Preparando', color: COLORS.accent },
  { value: 'ready', label: 'Listo', color: '#a78bfa' },
  { value: 'completed', label: 'Completado', color: COLORS.success },
  { value: 'cancelled', label: 'Cancelado', color: COLORS.error },
];

const statusMeta = (status) =>
  STATUS_OPTIONS.find((s) => s.value === status) || {
    label: status,
    color: COLORS.secondary,
  };

export default function ManagerOrdersScreen() {
  const restaurantId = useManagerStore((s) => s.restaurantId);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const intervalRef = useRef(null);

  const loadOrders = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await getOrdersByRestaurant(restaurantId);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
      intervalRef.current = setInterval(loadOrders, POLL_MS);
      return () => clearInterval(intervalRef.current);
    }, [loadOrders]),
  );

  const handleStatusChange = (orderId, currentStatus) => {
    const options = STATUS_OPTIONS.filter(
      (s) => !['completed', 'cancelled'].includes(currentStatus) || s.value === currentStatus,
    );
    Alert.alert('Cambiar estado', `Pedido #${orderId}`, [
      ...options.map((opt) => ({
        text: opt.label,
        onPress: async () => {
          try {
            await updateOrderStatus(orderId, opt.value);
            loadOrders();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'No se pudo actualizar');
          }
        },
      })),
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const handleInvoice = async (orderId) => {
    try {
      let invoice = await getInvoiceByOrder(orderId).catch(() => null);
      if (!invoice) invoice = await generateInvoice(orderId);
      Alert.alert(
        `Factura #${invoice.id}`,
        `Pedido #${invoice.order_id}\nSubtotal: ${formatPrice(invoice.subtotal)}\nIVA: ${formatPrice(invoice.tax)}\nTotal: ${formatPrice(invoice.total)}`,
      );
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo generar la factura');
    }
  };

  const filtered =
    statusFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === statusFilter);

  if (loading && orders.length === 0) {
    return <LoadingSpinner message="Cargando pedidos..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Monitor de Pedidos"
        subtitle={`Actualización automática cada ${POLL_MS / 1000}s`}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filters}
      >
        {STATUS_OPTIONS.map((s) => {
          const count = orders.filter((o) => o.status === s.value).length;
          const active = statusFilter === s.value;
          return (
            <StatusKpiChip
              key={s.value}
              count={count}
              label={s.label}
              color={s.color}
              active={active}
              onPress={() => setStatusFilter(active ? 'all' : s.value)}
            />
          );
        })}
      </ScrollView>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadOrders} tintColor={COLORS.accent} />
        }
        renderItem={({ item }) => {
          const meta = statusMeta(item.status);
          return (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Pedido #{item.id}</Text>
                <View style={[styles.badge, { backgroundColor: `${meta.color}33` }]}>
                  <Text style={[styles.badgeText, { color: meta.color }]}>{meta.label}</Text>
                </View>
              </View>
              <Text style={styles.date}>{formatDate(item.created_at, { time: true })}</Text>
              <Text style={styles.total}>{formatPrice(item.total)}</Text>
              {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
              <View style={styles.actions}>
                <Pressable style={styles.actionBtn} onPress={() => handleStatusChange(item.id, item.status)}>
                  <MaterialIcons name="sync" size={16} color={COLORS.accent} />
                  <Text style={styles.actionText}>Estado</Text>
                </Pressable>
                {['completed', 'confirmed', 'ready'].includes(item.status) ? (
                  <Pressable style={styles.actionBtn} onPress={() => handleInvoice(item.id)}>
                    <MaterialIcons name="receipt" size={16} color={COLORS.accent} />
                    <Text style={styles.actionText}>Factura</Text>
                  </Pressable>
                ) : null}
              </View>
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState icon="check-circle" title="No hay pedidos en este estado" />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  filters: { paddingHorizontal: SPACING.md, gap: SPACING.sm, paddingBottom: SPACING.sm },
  list: { padding: SPACING.md, paddingTop: 0, flexGrow: 1 },
  card: { marginBottom: SPACING.sm },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderId: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.text },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: FONT_SIZE.xs, fontWeight: '600' },
  date: { marginTop: 4, fontSize: FONT_SIZE.sm, color: COLORS.secondary },
  total: { marginTop: SPACING.xs, fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.accent },
  notes: { marginTop: 4, fontSize: FONT_SIZE.sm, color: COLORS.textLight },
  actions: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.accent },
});
