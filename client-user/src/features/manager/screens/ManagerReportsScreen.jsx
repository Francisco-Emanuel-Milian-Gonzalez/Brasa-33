// client-user/src/features/manager/screens/ManagerReportsScreen.jsx
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getReportOrdersByStatus,
  getReportReservations,
  getReportRevenue,
  getReportTopProducts,
} from '../../../shared/api/managerApi';
import { Card, LoadingSpinner } from '../../../shared/components/common/Common';
import ScreenHeader from '../../../shared/components/common/ScreenHeader';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { formatPrice } from '../../../shared/utils/formatters';
import { useManagerStore } from '../store/useManagerStore';

function StatCard({ label, value, accent }) {
  return (
    <Card style={styles.statCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, accent && { color: COLORS.accent }]}>{value}</Text>
    </Card>
  );
}

export default function ManagerReportsScreen() {
  const restaurantId = useManagerStore((s) => s.restaurantId);
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState(null);
  const [ordersByStatus, setOrdersByStatus] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [reservationsReport, setReservationsReport] = useState(null);

  const loadReports = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    const params = { restaurant_id: restaurantId };
    try {
      const [rev, orders, products, reservations] = await Promise.all([
        getReportRevenue(params),
        getReportOrdersByStatus(params),
        getReportTopProducts({ ...params, limit: 5 }),
        getReportReservations(params),
      ]);
      setRevenue(rev);
      setOrdersByStatus(Array.isArray(orders) ? orders : []);
      setTopProducts(Array.isArray(products) ? products : []);
      setReservationsReport(reservations);
    } catch {
      setRevenue(null);
      setOrdersByStatus([]);
      setTopProducts([]);
      setReservationsReport(null);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useFocusEffect(useCallback(() => { loadReports(); }, [loadReports]));

  if (loading && !revenue) {
    return <LoadingSpinner message="Cargando reportes..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadReports} tintColor={COLORS.accent} />
        }
      >
        <ScreenHeader title="Reportes" subtitle="Resumen de tu restaurante" />
        <View style={styles.grid}>
          <StatCard
            label="Ingresos totales"
            value={formatPrice(revenue?.total_revenue)}
            accent
          />
          <StatCard label="Pedidos" value={String(revenue?.total_orders ?? 0)} />
          <StatCard
            label="Ticket promedio"
            value={formatPrice(revenue?.average_order)}
          />
        </View>

        <Text style={styles.section}>Pedidos por estado</Text>
        {ordersByStatus.length === 0 ? (
          <Text style={styles.empty}>Sin datos</Text>
        ) : (
          ordersByStatus.map((row) => (
            <Card key={row.status} style={styles.rowCard}>
              <Text style={styles.rowLabel}>{row.status}</Text>
              <Text style={styles.rowValue}>
                {row.count} · {formatPrice(row.total_amount)}
              </Text>
            </Card>
          ))
        )}

        <Text style={styles.section}>Productos más vendidos</Text>
        {topProducts.length === 0 ? (
          <Text style={styles.empty}>Sin datos</Text>
        ) : (
          topProducts.map((p) => (
            <Card key={p.id} style={styles.rowCard}>
              <Text style={styles.rowLabel}>{p.name}</Text>
              <Text style={styles.rowValue}>
                {p.total_sold} vendidos · {formatPrice(p.total_revenue)}
              </Text>
            </Card>
          ))
        )}

        {reservationsReport?.summary ? (
          <>
            <Text style={styles.section}>Reservaciones</Text>
            <View style={styles.grid}>
              <StatCard label="Total" value={String(reservationsReport.summary.total ?? 0)} />
              <StatCard label="Pendientes" value={String(reservationsReport.summary.pending ?? 0)} />
              <StatCard label="Confirmadas" value={String(reservationsReport.summary.confirmed ?? 0)} />
            </View>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
  },
  statCard: { flex: 1, minWidth: '30%', alignItems: 'center' },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.secondary, textAlign: 'center' },
  statValue: { marginTop: 4, fontSize: FONT_SIZE.lg, fontWeight: '700', color: COLORS.text },
  section: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  rowCard: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowLabel: { fontSize: FONT_SIZE.sm, color: COLORS.text, textTransform: 'capitalize', flex: 1 },
  rowValue: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.accent },
  empty: { paddingHorizontal: SPACING.md, color: COLORS.secondary, fontSize: FONT_SIZE.sm },
});
