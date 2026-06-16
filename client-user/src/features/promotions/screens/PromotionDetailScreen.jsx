// client-user/src/features/promotions/screens/PromotionDetailScreen.jsx
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { usePromotions } from '../hooks/usePromotions';

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value).slice(0, 10)
    : date.toLocaleDateString('es', { day: '2-digit', month: 'long', year: 'numeric' });
};

export default function PromotionDetailScreen({ navigation, route }) {
  const { promotionId } = route.params;
  const { loading, error, fetchPromotionDetail } = usePromotions();
  const [promotion, setPromotion] = useState(null);
  const [restaurant, setRestaurant] = useState(null);

  useEffect(() => {
    let active = true;
    fetchPromotionDetail(promotionId).then((result) => {
      if (active && result) {
        setPromotion(result.promotion);
        setRestaurant(result.restaurant);
      }
    });
    return () => {
      active = false;
    };
  }, [fetchPromotionDetail, promotionId]);

  if (loading && !promotion) {
    return <LoadingSpinner message="Cargando promoción..." />;
  }

  if (!promotion) {
    return (
      <EmptyState
        icon="local-offer"
        title="Promoción no encontrada"
        description={error || 'No se pudo cargar la promoción.'}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.promoCard}>
        {promotion.discount_percent ? (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              -{Number(promotion.discount_percent)}%
            </Text>
          </View>
        ) : null}
        <Text style={styles.title}>{promotion.title}</Text>
        {promotion.description ? (
          <Text style={styles.description}>{promotion.description}</Text>
        ) : null}
        {promotion.start_date || promotion.end_date ? (
          <View style={styles.datesRow}>
            <MaterialIcons name="date-range" size={16} color={COLORS.textLight} />
            <Text style={styles.datesText}>
              {promotion.start_date ? `Del ${formatDate(promotion.start_date)}` : ''}
              {promotion.end_date ? ` al ${formatDate(promotion.end_date)}` : ''}
            </Text>
          </View>
        ) : null}
      </Card>

      {restaurant ? (
        <>
          <Text style={styles.sectionTitle}>Restaurante</Text>
          <Pressable
            onPress={() =>
              navigation.navigate('Restaurants', {
                screen: 'RestaurantDetail',
                params: { restaurantId: restaurant.id },
              })
            }
          >
            <Card style={styles.restaurantCard}>
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>{restaurant.name}</Text>
                <View style={styles.infoRow}>
                  <MaterialIcons name="place" size={14} color={COLORS.textLight} />
                  <Text style={styles.infoText} numberOfLines={2}>
                    {restaurant.address}
                  </Text>
                </View>
                {restaurant.phone ? (
                  <View style={styles.infoRow}>
                    <MaterialIcons name="phone" size={14} color={COLORS.textLight} />
                    <Text style={styles.infoText}>{restaurant.phone}</Text>
                  </View>
                ) : null}
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.textLight} />
            </Card>
          </Pressable>
        </>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
  },
  promoCard: {
    alignItems: 'center',
  },
  discountBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: 999,
    backgroundColor: COLORS.accent,
    marginBottom: SPACING.sm,
  },
  discountText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  description: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  datesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.sm,
  },
  datesText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  restaurantCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  restaurantInfo: {
    flex: 1,
    gap: 2,
  },
  restaurantName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
});
