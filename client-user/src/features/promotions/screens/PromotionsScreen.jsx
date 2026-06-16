// client-user/src/features/promotions/screens/PromotionsScreen.jsx
import { useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { usePromotions } from '../hooks/usePromotions';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value).slice(0, 10)
    : date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
};

export default function PromotionsScreen({ navigation }) {
  const { promotions, loading, error, fetchPromotions } = usePromotions();

  useFocusEffect(
    useCallback(() => {
      fetchPromotions();
    }, [fetchPromotions]),
  );

  if (loading && promotions.length === 0) {
    return <LoadingSpinner message="Cargando promociones..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <Text style={styles.title}>Promociones</Text>
      <FlatList
        data={promotions}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchPromotions}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() =>
              navigation.navigate('PromotionDetail', { promotionId: item.id })
            }
          >
            <Card style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    {item.discount_percent ? `-${Number(item.discount_percent)}%` : 'Promo'}
                  </Text>
                </View>
                <View style={styles.cardInfo}>
                  <Text style={styles.promoTitle} numberOfLines={2}>
                    {item.title}
                  </Text>
                  {item.restaurant_name ? (
                    <Text style={styles.restaurantName} numberOfLines={1}>
                      {item.restaurant_name}
                    </Text>
                  ) : null}
                </View>
                <MaterialIcons name="chevron-right" size={24} color={COLORS.textLight} />
              </View>
              {item.start_date || item.end_date ? (
                <View style={styles.datesRow}>
                  <MaterialIcons name="date-range" size={14} color={COLORS.textLight} />
                  <Text style={styles.datesText}>
                    {formatDate(item.start_date)}
                    {item.end_date ? ` — ${formatDate(item.end_date)}` : ''}
                  </Text>
                </View>
              ) : null}
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="local-offer"
            title={error ? 'Error al cargar' : 'Sin promociones'}
            description={error || 'No hay promociones activas en este momento.'}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  listContent: {
    padding: SPACING.md,
    paddingTop: 0,
    flexGrow: 1,
  },
  card: {
    marginBottom: SPACING.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  discountBadge: {
    minWidth: 56,
    paddingHorizontal: SPACING.xs,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '700',
    color: COLORS.text,
  },
  cardInfo: {
    flex: 1,
  },
  promoTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  restaurantName: {
    marginTop: 2,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  datesText: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
  },
});
