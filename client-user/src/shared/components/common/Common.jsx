// client-user/src/shared/components/common/Common.jsx
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SHADOWS, SPACING } from '../../constants/theme';

/**
 * Indicador de carga a pantalla completa.
 *
 * @param {object} props
 * @param {string} [props.message='Cargando...']
 */
export function LoadingSpinner({ message = 'Cargando...' }) {
  return (
    <View style={styles.centered}>
      <ActivityIndicator size="large" color={COLORS.accent} />
      {message ? <Text style={styles.loadingText}>{message}</Text> : null}
    </View>
  );
}

/**
 * Estado vacío con ícono, título y descripción opcional.
 *
 * @param {object} props
 * @param {string} [props.icon='inbox'] - Nombre de ícono de MaterialIcons.
 * @param {string} [props.title='Sin resultados']
 * @param {string} [props.description]
 * @param {import('react').ReactNode} [props.children] - Acción opcional (ej. un botón).
 */
export function EmptyState({
  icon = 'inbox',
  title = 'Sin resultados',
  description,
  children,
}) {
  return (
    <View style={styles.centered}>
      <MaterialIcons name={icon} size={56} color={COLORS.textLight} />
      <Text style={styles.emptyTitle}>{title}</Text>
      {description ? <Text style={styles.emptyDescription}>{description}</Text> : null}
      {children ? <View style={styles.emptyAction}>{children}</View> : null}
    </View>
  );
}

/**
 * Tarjeta contenedora con sombra.
 *
 * @param {object} props
 * @param {object} [props.style]
 * @param {import('react').ReactNode} props.children
 */
export function Card({ style, children }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
  },
  emptyTitle: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
  },
  emptyDescription: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  emptyAction: {
    marginTop: SPACING.lg,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.sm,
  },
});
