// client-user/src/shared/components/common/Button.jsx
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme';

/**
 * Botón reutilizable.
 *
 * @param {object} props
 * @param {string} props.title - Texto del botón.
 * @param {() => void} [props.onPress]
 * @param {'primary'|'secondary'|'accent'} [props.variant='primary']
 * @param {boolean} [props.loading=false] - Muestra spinner y deshabilita el botón.
 * @param {boolean} [props.disabled=false]
 * @param {object} [props.style] - Estilos adicionales del contenedor.
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  style,
}) {
  const isDisabled = disabled || loading;
  const variantStyle =
    variant === 'accent' ? styles.accent : variant === 'secondary' ? styles.secondary : styles.primary;
  const textStyle =
    variant === 'accent'
      ? styles.textAccent
      : variant === 'secondary'
        ? styles.textSecondary
        : styles.textPrimary;

  const spinnerColor =
    variant === 'primary' ? COLORS.primaryText : COLORS.text;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={spinnerColor} />
      ) : (
        <Text style={[styles.text, textStyle]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: RADIUS.md,
    paddingVertical: SPACING.md - 2,
    paddingHorizontal: SPACING.lg,
    minHeight: 48,
  },
  primary: {
    backgroundColor: COLORS.primary,
  },
  secondary: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  accent: {
    backgroundColor: COLORS.accent,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  textPrimary: {
    color: COLORS.primaryText,
  },
  textSecondary: {
    color: COLORS.text,
  },
  textAccent: {
    color: COLORS.text,
  },
});
