// client-user/src/shared/components/common/Input.jsx
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme';

/**
 * Campo de texto con etiqueta y mensaje de error.
 * Acepta todas las props de TextInput (value, onChangeText, secureTextEntry, etc.).
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {string} [props.error] - Mensaje de error a mostrar bajo el campo.
 * @param {object} [props.containerStyle]
 */
export default function Input({ label, error, containerStyle, style, ...rest }) {
  return (
    <View style={[styles.container, containerStyle]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        placeholderTextColor={COLORS.textLight}
        style={[styles.input, error && styles.inputError, style]}
        {...rest}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.secondary,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 4,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    minHeight: 48,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  error: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
  },
});
