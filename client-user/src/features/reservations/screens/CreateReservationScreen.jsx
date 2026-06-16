// client-user/src/features/reservations/screens/CreateReservationScreen.jsx
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
} from 'react-native';
import Button from '../../../shared/components/common/Button';
import Input from '../../../shared/components/common/Input';
import { Card, EmptyState } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useReservations } from '../hooks/useReservations';

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;

export default function CreateReservationScreen({ navigation, route }) {
  const { restaurantId, restaurantName } = route.params || {};
  const { createReservation, loading, error } = useReservations();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { date: '', time: '', people_count: '2', notes: '' },
  });

  // Sin restaurante seleccionado no se puede reservar: se guía al usuario.
  if (!restaurantId) {
    return (
      <EmptyState
        icon="storefront"
        title="Elige un restaurante"
        description="Para crear una reservación, entra al restaurante y pulsa “Reservar mesa”."
      >
        <Button
          title="Ver restaurantes"
          onPress={() => navigation.navigate('Restaurants')}
        />
      </EmptyState>
    );
  }

  const onSubmit = async (values) => {
    const result = await createReservation({
      restaurant_id: restaurantId,
      guest_count: Number(values.people_count),
      reservation_date: `${values.date}T${values.time}`,
      special_requests: values.notes?.trim() || null,
    });

    if (result.success) {
      Alert.alert(
        'Reservación creada',
        'Tu reservación quedó pendiente de confirmación por el restaurante.',
        [{ text: 'Aceptar', onPress: () => navigation.navigate('ReservationsList') }],
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Card style={styles.headerCard}>
          <Text style={styles.restaurantLabel}>Reservación en</Text>
          <Text style={styles.restaurantName}>{restaurantName || 'Restaurante'}</Text>
        </Card>

        <Controller
          control={control}
          name="date"
          rules={{
            required: 'La fecha es obligatoria',
            pattern: { value: DATE_PATTERN, message: 'Usa el formato AAAA-MM-DD' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Fecha (AAAA-MM-DD)"
              placeholder="2026-07-15"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.date?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="time"
          rules={{
            required: 'La hora es obligatoria',
            pattern: { value: TIME_PATTERN, message: 'Usa el formato HH:MM (24 horas)' },
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Hora (HH:MM)"
              placeholder="19:30"
              autoCapitalize="none"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.time?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="people_count"
          rules={{
            required: 'Indica cuántas personas asistirán',
            validate: (value) =>
              Number(value) > 0 || 'Debe ser un número mayor a 0',
          }}
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Número de personas"
              placeholder="2"
              keyboardType="number-pad"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              error={errors.people_count?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <Input
              label="Notas (opcional)"
              placeholder="Aniversario, mesa cerca de la ventana..."
              multiline
              numberOfLines={3}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
            />
          )}
        />

        {error ? <Text style={styles.apiError}>{error}</Text> : null}

        <Button title="Crear reservación" loading={loading} onPress={handleSubmit(onSubmit)} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  restaurantLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  restaurantName: {
    marginTop: 2,
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  apiError: {
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    textAlign: 'center',
  },
});
