// client-user/src/shared/components/common/ScreenHeader.jsx
import { StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZE, SPACING } from '../../constants/theme';

export default function ScreenHeader({ title, subtitle }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.sm,
    paddingBottom: SPACING.md,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  subtitle: {
    marginTop: 4,
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
  },
});
