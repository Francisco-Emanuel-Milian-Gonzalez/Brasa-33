import { Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../../constants/theme';

const PALETTE_COUNT = '#3d3d3d';

/**
 * Panel KPI — pálido en reposo, color + sombra al presionar o al estar activo.
 */
export function StatusKpiChip({ count, label, color, active, onPress, style }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        style,
        (active || pressed) && {
          borderColor: `${color}73`,
          backgroundColor: `${color}1A`,
          shadowColor: color,
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.38,
          shadowRadius: 14,
          elevation: 8,
          transform: [{ translateY: -2 }],
        },
      ]}
    >
      {({ pressed }) => (
        <>
          <View
            style={[
              styles.accent,
              { backgroundColor: color },
              (active || pressed) ? styles.accentVisible : styles.accentMuted,
            ]}
          />
          <Text
            style={[
              styles.count,
              (active || pressed) && styles.countActive,
            ]}
          >
            {count}
          </Text>
          <Text
            style={[
              styles.label,
              (active || pressed) && { color, opacity: 0.85 },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minWidth: 72,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.card,
    alignItems: 'center',
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    top: 0,
    left: SPACING.sm,
    right: SPACING.sm,
    height: 2,
    borderRadius: 999,
  },
  accentMuted: { opacity: 0.12 },
  accentVisible: { opacity: 1 },
  count: {
    marginTop: 4,
    fontSize: FONT_SIZE.xl,
    fontWeight: '600',
    color: PALETTE_COUNT,
    lineHeight: FONT_SIZE.xl + 2,
  },
  countActive: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontWeight: '600',
    color: '#FFFFFF',
  },
  label: {
    marginTop: 4,
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
