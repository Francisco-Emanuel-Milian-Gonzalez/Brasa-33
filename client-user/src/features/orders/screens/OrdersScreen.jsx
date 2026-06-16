// client-user/src/features/orders/screens/OrdersScreen.jsx
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenHeader from '../../../shared/components/common/ScreenHeader';
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

export default function OrdersScreen({ navigation }) {
  const { orders, loading, error, fetchMyOrders, cancelOrder } = useOrders();

  useFocusEffect(
    useCallback(() => {
      fetchMyOrders();
    }, [fetchMyOrders]),
  );

  const handleCancel = (order) => {
    Alert.alert('Cancelar orden', `¿Seguro que deseas cancelar la orden #${order.id}?`, [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          const result = await cancelOrder(order.id);
          if (result.success) {
            fetchMyOrders();
          } else {
            Alert.alert('Error', result.error);
          }
        },
      },
    ]);
  };

  if (loading && orders.length === 0) {
    return <LoadingSpinner message="Cargando órdenes..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Mis pedidos" />
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchMyOrders}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => navigation.navigate('OrderDetail', { orderId: item.id })}
          >
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.orderId}>Orden #{item.id}</Text>
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: STATUS_COLORS[item.normalizedStatus] || COLORS.secondary },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {STATUS_LABELS[item.normalizedStatus] || item.status}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="schedule" size={16} color={COLORS.textLight} />
                <Text style={styles.infoText}>{formatDate(item.created_at)}</Text>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.total}>{formatPrice(item.total)}</Text>
                {item.normalizedStatus === 'PENDING' ? (
                  <Pressable style={styles.cancelButton} onPress={() => handleCancel(item)}>
                    <MaterialIcons name="close" size={16} color={COLORS.error} />
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </Pressable>
                ) : null}
              </View>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="receipt-long"
            title={error ? 'Error al cargar' : 'Sin órdenes'}
            description={
              error || 'Aún no tienes órdenes. Crea una desde el menú de un restaurante.'
            }
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: 0,
    flexGrow: 1,
  },
  card: {
    marginBottom: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  orderId: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  total: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.accent,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cancelText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.error,
  },
});
