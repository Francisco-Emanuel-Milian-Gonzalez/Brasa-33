// client-user/src/features/manager/screens/ManagerMoreScreen.jsx
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import ScreenHeader from '../../../shared/components/common/ScreenHeader';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';

const MENU_ITEMS = [
  { key: 'Inventory', label: 'Inventario', icon: 'inventory', subtitle: 'Ingredientes y stock' },
  { key: 'Reports', label: 'Reportes', icon: 'bar-chart', subtitle: 'Ingresos y estadísticas' },
  { key: 'Profile', label: 'Mi perfil', icon: 'person', subtitle: 'Datos de tu cuenta' },
];

export default function ManagerMoreScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader title="Más opciones" subtitle="Inventario, reportes y perfil" />
      <View style={styles.list}>
        {MENU_ITEMS.map((item) => (
          <Pressable
            key={item.key}
            style={styles.item}
            onPress={() => navigation.navigate(item.key)}
          >
            <View style={styles.iconWrap}>
              <MaterialIcons name={item.icon} size={24} color={COLORS.accent} />
            </View>
            <View style={styles.textWrap}>
              <Text style={styles.label}>{item.label}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={24} color={COLORS.textLight} />
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.background },
  list: { padding: SPACING.md, gap: SPACING.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: `${COLORS.accent}18`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: { flex: 1 },
  label: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.secondary, marginTop: 2 },
});
