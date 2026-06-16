// client-user/src/features/auth/screens/RegisterScreen.jsx
import { Controller, useForm } from 'react-hook-form';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import Button from '../../../shared/components/common/Button';
import ImagePickerField from '../../../shared/components/common/ImagePickerField';
import Input from '../../../shared/components/common/Input';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../hooks/useAuth';

// Reglas alineadas con las validaciones del auth-service (RegisterDto).
const PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\-#.])[A-Za-z\d@$!%*?&_\-#.]{8,}$/;
const USERNAME_PATTERN = /^[a-zA-Z0-9_.]+$/;
const PHONE_PATTERN = /^\d{8}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterScreen({ navigation }) {
  const { handleRegister, loading, error } = useAuth();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      surname: '',
      username: '',
      email: '',
      password: '',
      phone: '',
      profilePicture: null,
    },
  });

  const onSubmit = async (values) => {
    const result = await handleRegister(values);
    if (result.success) {
      Alert.alert(
        'Registro exitoso',
        'Tu cuenta fue creada. Revisa tu correo para activarla antes de iniciar sesión.',
        [{ text: 'Aceptar', onPress: () => navigation.navigate('Login') }],
      );
    }
  };

  return (
    <AuthLayout
      title="Crear cuenta"
      subtitle="Únete a La 33 y disfruta de nuestros restaurantes"
    >
          <Controller
            control={control}
            name="name"
            rules={{
              required: 'El nombre es obligatorio',
              maxLength: { value: 25, message: 'Máximo 25 caracteres' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Nombre"
                placeholder="Juan"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="surname"
            rules={{
              required: 'El apellido es obligatorio',
              maxLength: { value: 25, message: 'Máximo 25 caracteres' },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Apellido"
                placeholder="Pérez"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.surname?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="username"
            rules={{
              required: 'El username es obligatorio',
              maxLength: { value: 25, message: 'Máximo 25 caracteres' },
              pattern: {
                value: USERNAME_PATTERN,
                message: 'Solo letras, números, guión bajo o punto',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Usuario"
                placeholder="juan.perez"
                autoCapitalize="none"
                autoCorrect={false}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.username?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            rules={{
              required: 'El email es obligatorio',
              pattern: {
                value: EMAIL_PATTERN,
                message: 'El formato del email no es válido',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Email"
                placeholder="correo@ejemplo.com"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            rules={{
              required: 'La contraseña es obligatoria',
              pattern: {
                value: PASSWORD_PATTERN,
                message:
                  'Mínimo 8 caracteres, con mayúscula, minúscula, número y carácter especial (@$!%*?&_-#.)',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Contraseña"
                placeholder="Mínimo 8 caracteres"
                secureTextEntry
                autoCapitalize="none"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.password?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="phone"
            rules={{
              required: 'El teléfono es obligatorio',
              pattern: {
                value: PHONE_PATTERN,
                message: 'El teléfono debe tener exactamente 8 dígitos',
              },
            }}
            render={({ field: { onChange, onBlur, value } }) => (
              <Input
                label="Teléfono"
                placeholder="88888888"
                keyboardType="number-pad"
                maxLength={8}
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.phone?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="profilePicture"
            render={({ field: { onChange, value } }) => (
              <ImagePickerField
                label="Imagen de perfil"
                value={value}
                onChange={onChange}
              />
            )}
          />

          {error ? <Text style={styles.apiError}>{error}</Text> : null}

          <Button
            title="Crear cuenta"
            loading={loading}
            onPress={handleSubmit(onSubmit)}
            style={styles.submitButton}
          />

          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes cuenta?</Text>
            <Pressable onPress={() => navigation.navigate('Login')}>
              <Text style={styles.footerLink}>Inicia sesión</Text>
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
