// client-user/src/features/reservations/screens/ReservationsScreen.jsx
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
import { useReservations } from '../hooks/useReservations';

const STATUS_LABELS = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmada',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
};

const STATUS_COLORS = {
  PENDING: COLORS.warning,
  CONFIRMED: COLORS.success,
  COMPLETED: COLORS.secondary,
  CANCELLED: COLORS.error,
};

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value).slice(0, 10)
    : date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function ReservationsScreen({ navigation }) {
  const { reservations, loading, error, fetchMyReservations, cancelReservation } =
    useReservations();

  useFocusEffect(
    useCallback(() => {
      fetchMyReservations();
    }, [fetchMyReservations]),
  );

  const handleCancel = (reservation) => {
    Alert.alert(
      'Cancelar reservación',
      `¿Seguro que deseas cancelar tu reservación en ${reservation.restaurant_name}?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            const result = await cancelReservation(reservation.id);
            if (result.success) {
              fetchMyReservations();
            } else {
              Alert.alert('Error', result.error);
            }
          },
        },
      ],
    );
  };

  if (loading && reservations.length === 0) {
    return <LoadingSpinner message="Cargando reservaciones..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Mis reservas" />
      <FlatList
        data={reservations}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchMyReservations}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
        renderItem={({ item }) => {
          const editable = !['CANCELLED', 'COMPLETED'].includes(item.normalizedStatus);
          return (
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.restaurantName} numberOfLines={1}>
                  {item.restaurant_name}
                </Text>
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
                <MaterialIcons name="event" size={16} color={COLORS.textLight} />
                <Text style={styles.infoText}>
                  {formatDate(item.date)} · {String(item.time || '').slice(0, 5)}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="group" size={16} color={COLORS.textLight} />
                <Text style={styles.infoText}>
                  {item.people_count} {item.people_count === 1 ? 'persona' : 'personas'}
                </Text>
              </View>
              {item.notes ? (
                <View style={styles.infoRow}>
                  <MaterialIcons name="notes" size={16} color={COLORS.textLight} />
                  <Text style={styles.infoText} numberOfLines={2}>
                    {item.notes}
                  </Text>
                </View>
              ) : null}
              {editable ? (
                <View style={styles.actions}>
                  <Pressable
                    style={styles.actionButton}
                    onPress={() =>
                      navigation.navigate('EditReservation', { reservation: item })
                    }
                  >
                    <MaterialIcons name="edit" size={16} color={COLORS.accent} />
                    <Text style={styles.actionText}>Editar</Text>
                  </Pressable>
                  <Pressable style={styles.actionButton} onPress={() => handleCancel(item)}>
                    <MaterialIcons name="close" size={16} color={COLORS.error} />
                    <Text style={[styles.actionText, { color: COLORS.error }]}>
                      Cancelar
                    </Text>
                  </Pressable>
                </View>
              ) : null}
            </Card>
          );
        }}
        ListEmptyComponent={
          <EmptyState
            icon="event-seat"
            title={error ? 'Error al cargar' : 'Sin reservaciones'}
            description={
              error || 'Aún no tienes reservaciones. Crea una desde un restaurante.'
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
    gap: SPACING.sm,
  },
  restaurantName: {
    flex: 1,
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
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
  },
  actions: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.accent,
  },
});
