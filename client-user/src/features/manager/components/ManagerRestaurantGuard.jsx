// client-user/src/features/manager/components/ManagerRestaurantGuard.jsx
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { LoadingSpinner } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useManagerStore } from '../store/useManagerStore';

export default function ManagerRestaurantGuard({ children }) {
  const { myRestaurant, loading, error, fetchMyRestaurant } = useManagerStore();

  useEffect(() => {
    fetchMyRestaurant();
  }, [fetchMyRestaurant]);

  if (loading && !myRestaurant) {
    return <LoadingSpinner message="Cargando tu restaurante..." />;
  }

  if (error && !myRestaurant) {
    return (
      <View style={styles.errorBox}>
        <Text style={styles.errorTitle}>Restaurante no disponible</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  errorBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    backgroundColor: COLORS.background,
  },
  errorTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  errorText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    textAlign: 'center',
  },
});
