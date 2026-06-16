// client-user/src/features/auth/components/AuthLayout.jsx
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, FONT_SIZE, RADIUS, SHADOWS, SPACING } from '../../../shared/constants/theme';

/**
 * Layout de autenticación al estilo cliente-labrasa33:
 * fondo oscuro + tarjeta carbón centrada con logo La 33.
 */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Image
              source={require('../../../../assets/sarten33.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brand}>LA 33</Text>
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            <View style={styles.form}>{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  flex: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
    ...SHADOWS.md,
  },
  logo: {
    width: 80,
    height: 80,
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  brand: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xs,
    letterSpacing: 4,
    textTransform: 'uppercase',
    color: COLORS.secondary,
    marginBottom: SPACING.md,
  },
  title: {
    textAlign: 'center',
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    marginBottom: SPACING.lg,
  },
  form: {
    marginTop: SPACING.sm,
  },
});
