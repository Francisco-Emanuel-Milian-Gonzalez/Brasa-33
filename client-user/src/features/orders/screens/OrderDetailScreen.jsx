// client-user/src/features/orders/screens/OrderDetailScreen.jsx
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useOrders } from '../hooks/useOrders';

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  PREPARING: 'En preparación',
  READY: 'Lista',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const STATUS_COLORS = {
  PENDING: COLORS.warning,
  CONFIRMED: COLORS.success,
  PREPARING: COLORS.secondary,
  READY: COLORS.success,
  COMPLETED: COLORS.secondary,
  CANCELLED: COLORS.error,
};

const formatPrice = (value) => `Q${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString('es', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
};

export default function OrderDetailScreen({ route }) {
  const { orderId } = route.params;
  const { loading, error, fetchOrderById } = useOrders();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    let active = true;
    fetchOrderById(orderId).then((data) => {
      if (active) setOrder(data);
    });
    return () => {
      active = false;
    };
  }, [fetchOrderById, orderId]);

  if (loading && !order) {
    return <LoadingSpinner message="Cargando orden..." />;
  }

  if (!order) {
    return (
      <EmptyState
        icon="receipt-long"
        title="Orden no encontrada"
        description={error || 'No se pudo cargar la orden.'}
      />
    );
  }

  const items = order.items || [];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <Text style={styles.orderId}>Orden #{order.id}</Text>
          <View
            style={[
              styles.badge,
              { backgroundColor: STATUS_COLORS[order.normalizedStatus] || COLORS.secondary },
            ]}
          >
            <Text style={styles.badgeText}>
              {STATUS_LABELS[order.normalizedStatus] || order.status}
            </Text>
          </View>
        </View>
        <Text style={styles.date}>{formatDate(order.created_at)}</Text>
        {order.notes ? <Text style={styles.notes}>Notas: {order.notes}</Text> : null}
      </Card>

      <Text style={styles.sectionTitle}>Platos</Text>
      {items.length === 0 ? (
        <EmptyState icon="restaurant-menu" title="Sin items" description="Esta orden no tiene platos." />
      ) : (
        items.map((item) => (
          <Card key={String(item.id ?? item.menu_id)} style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQty}>
                {item.quantity} × {formatPrice(item.price)}
              </Text>
            </View>
            <Text style={styles.itemSubtotal}>
              {formatPrice(Number(item.price) * item.quantity)}
            </Text>
          </Card>
        ))
      )}

      <Card style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  headerCard: {
    marginBottom: SPACING.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    color: COLORS.text,
  },
  date: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
  },
  notes: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemQty: {
    marginTop: 2,
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
  },
  itemSubtotal: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.accent,
  },
  totalCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
  },
  totalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
