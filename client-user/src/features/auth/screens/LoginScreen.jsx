// client-user/src/features/auth/screens/LoginScreen.jsx
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../../shared/components/common/Button';
import Input from '../../../shared/components/common/Input';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';

export default function LoginScreen({ navigation }) {
  const { handleLogin, loading, error } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { emailOrUsername: '', password: '' },
  });

  const onSubmit = async (values) => {
    await handleLogin(values);
  };

  return (
    <AuthLayout title="Iniciar sesión" subtitle="Accede a tu cuenta La 33">
      <Controller
        control={control}
        name="emailOrUsername"
        rules={{ required: 'El email o usuario es obligatorio' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Email o usuario"
            placeholder="correo@ejemplo.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.emailOrUsername?.message}
          />
        )}
      />

      <Controller
        control={control}
        name="password"
        rules={{ required: 'La contraseña es obligatoria' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <Input
            label="Contraseña"
            placeholder="Tu contraseña"
            secureTextEntry
            autoCapitalize="none"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            error={errors.password?.message}
          />
        )}
      />

      {error ? <Text style={styles.apiError}>{error}</Text> : null}

      <Button
        title="Iniciar sesión"
        loading={loading}
        onPress={handleSubmit(onSubmit)}
        style={styles.submitButton}
      />

      <View style={styles.footer}>
        <Text style={styles.footerText}>¿No tienes cuenta?</Text>
        <Pressable onPress={() => navigation.navigate('Register')}>
          <Text style={styles.footerLink}>Regístrate</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  apiError: {
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: SPACING.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
  },
  footerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
  },
  footerLink: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
