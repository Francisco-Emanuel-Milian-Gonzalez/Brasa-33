// client-user/src/features/manager/screens/ManagerReservationsScreen.jsx
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import {
  cancelReservationManager,
  completeReservation,
  getReservationsByRestaurant,
} from '../../../shared/api/managerApi';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import ScreenHeader from '../../../shared/components/common/ScreenHeader';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { formatDate } from '../../../shared/utils/formatters';
import { useManagerStore } from '../store/useManagerStore';

const STATUS_COLORS = {
  pending: COLORS.warning,
  confirmed: COLORS.success,
  completed: COLORS.secondary,
  cancelled: COLORS.error,
};

export default function ManagerReservationsScreen() {
  const restaurantId = useManagerStore((s) => s.restaurantId);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadReservations = useCallback(async () => {
    if (!restaurantId) return;
    setLoading(true);
    try {
      const data = await getReservationsByRestaurant(restaurantId);
      setReservations(Array.isArray(data) ? data : []);
    } catch {
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useFocusEffect(useCallback(() => { loadReservations(); }, [loadReservations]));

  const handleComplete = async (id) => {
    try {
      await completeReservation(id);
      loadReservations();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'No se pudo completar');
    }
  };

  const handleCancel = (id) => {
    Alert.alert('Cancelar reservación', '¿Confirmas la cancelación?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Sí, cancelar',
        style: 'destructive',
        onPress: async () => {
          try {
            await cancelReservationManager(id);
            loadReservations();
          } catch (err) {
            Alert.alert('Error', err.response?.data?.message || 'No se pudo cancelar');
          }
        },
      },
    ]);
  };

  if (loading && reservations.length === 0) {
    return <LoadingSpinner message="Cargando reservaciones..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Reservaciones" subtitle="Gestiona las reservas de tu restaurante" />
      <FlatList
        data={reservations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadReservations} tintColor={COLORS.accent} />
        }
        renderItem={({ item }) => {
          const status = (item.status || '').toLowerCase();
          const color = STATUS_COLORS[status] || COLORS.secondary;
          const canAct = !['completed', 'cancelled'].includes(status);
          return (
            <Card style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.id}>Reserva #{item.id}</Text>
                <View style={[styles.badge, { backgroundColor: `${color}33` }]}>
                  <Text style={[styles.badgeText, { color }]}>{item.status}</Text>
                </View>
              </View>
              <View style={styles.row}>
                <MaterialIcons name="event" size={16} color={COLORS.textLight} />
                <Text style={styles.info}>
                  {formatDate(item.date)} · {String(item.time || '').slice(0, 5)}
                </Text>
              </View>
              <View style={styles.row}>
                <MaterialIcons name="group" size={16} color={COLORS.textLight} />
                <Text style={styles.info}>{item.people_count} personas</Text>
              </View>
              {canAct ? (
                <View style={styles.actions}>
                  <Pressable style={styles.action} onPress={() => handleComplete(item.id)}>
                    <MaterialIcons name="check-circle" size={16} color={COLORS.success} />
                    <Text style={[styles.actionText, { color: COLORS.success }]}>Completar</Text>
                  </Pressable>
                  <Pressable style={styles.action} onPress={() => handleCancel(item.id)}>
                    <MaterialIcons name="close" size={16} color={COLORS.error} />
                    <Text style={[styles.actionText, { color: COLORS.error }]}>Cancelar</Text>
                  </Pressable>
                </View>
              ) : null}
            </Card>
          );
        }}
        ListEmptyComponent={<EmptyState icon="event-seat" title="Sin reservaciones" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, flexGrow: 1 },
  card: { marginBottom: SPACING.sm },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  id: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  badge: { paddingHorizontal: SPACING.sm, paddingVertical: 2, borderRadius: 999 },
  badgeText: { fontSize: FONT_SIZE.xs, fontWeight: '600', textTransform: 'capitalize' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  info: { fontSize: FONT_SIZE.sm, color: COLORS.secondary },
  actions: { flexDirection: 'row', gap: SPACING.lg, marginTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  action: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: FONT_SIZE.sm, fontWeight: '600' },
});
