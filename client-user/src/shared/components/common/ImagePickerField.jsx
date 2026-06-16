// client-user/src/shared/components/common/ImagePickerField.jsx
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../constants/theme';

/**
 * Selector de imagen para formularios multipart (registro / perfil).
 *
 * @param {object} props
 * @param {string} [props.label]
 * @param {import('expo-image-picker').ImagePickerAsset | null} [props.value]
 * @param {(asset: import('expo-image-picker').ImagePickerAsset | null) => void} props.onChange
 * @param {string} [props.error]
 */
export default function ImagePickerField({ label, value, onChange, error }) {
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso a tu galería para seleccionar una imagen de perfil.',
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChange(result.assets[0]);
    }
  };

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Pressable
        accessibilityRole="button"
        onPress={pickImage}
        style={[styles.picker, error && styles.pickerError]}
      >
        {value?.uri ? (
          <Image source={{ uri: value.uri }} style={styles.preview} />
        ) : (
          <View style={styles.placeholderWrap}>
            <MaterialIcons name="add-a-photo" size={28} color={COLORS.secondary} />
            <Text style={styles.placeholder}>Seleccionar imagen...</Text>
          </View>
        )}
      </Pressable>
      {value?.uri ? (
        <Pressable onPress={() => onChange(null)} hitSlop={8}>
          <Text style={styles.clearText}>Quitar imagen</Text>
        </Pressable>
      ) : (
        <Text style={styles.hint}>Opcional — JPG, PNG o WebP (máx. 5 MB)</Text>
      )}
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
  picker: {
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    borderRadius: RADIUS.md,
    minHeight: 96,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  pickerError: {
    borderColor: COLORS.error,
  },
  placeholderWrap: {
    alignItems: 'center',
    gap: SPACING.xs,
    padding: SPACING.md,
  },
  placeholder: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  preview: {
    width: '100%',
    height: 160,
    resizeMode: 'cover',
  },
  hint: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  clearText: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    color: COLORS.accent,
    fontWeight: '600',
  },
  error: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
  },
});
