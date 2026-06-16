// client-user/src/features/restaurants/screens/DishDetailScreen.jsx
import { useCallback, useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ReviewFormModal from '../../reviews/components/ReviewFormModal';
import { useReviews } from '../../reviews/hooks/useReviews';
import Button from '../../../shared/components/common/Button';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useRestaurants } from '../hooks/useRestaurants';

const formatPrice = (value) => `Q${Number(value || 0).toFixed(2)}`;

const formatDate = (value) => {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
};

function Stars({ rating }) {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialIcons
          key={star}
          name={star <= rounded ? 'star' : 'star-border'}
          size={18}
          color={COLORS.warning}
        />
      ))}
    </View>
  );
}

export default function DishDetailScreen({ route }) {
  const { dish } = route.params;
  const { loading, error, fetchDishReviews } = useRestaurants();
  const { loading: reviewLoading, createReview } = useReviews();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ total_reviews: 0, average_rating: null });
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  const loadReviews = useCallback(async () => {
    const result = await fetchDishReviews(dish.id);
    if (result) {
      setReviews(result.reviews);
      setStats(result.stats);
    }
  }, [dish.id, fetchDishReviews]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleCreateReview = async ({ rating, comment }) => {
    const result = await createReview({
      restaurant_id: dish.restaurant_id || null,
      menu_id: dish.id,
      rating,
      comment,
    });
    if (result.success) {
      setReviewModalVisible(false);
      Alert.alert('Reseña publicada', 'Gracias por compartir tu experiencia.');
      loadReviews();
    } else {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Card style={styles.dishCard}>
        {dish.image_url ? (
          <Image source={{ uri: dish.image_url }} style={styles.image} />
        ) : (
          <View style={styles.imageFallback}>
            <MaterialIcons name="restaurant-menu" size={48} color={COLORS.accent} />
          </View>
        )}
        <Text style={styles.name}>{dish.name}</Text>
        {dish.description ? (
          <Text style={styles.description}>{dish.description}</Text>
        ) : null}
        <Text style={styles.price}>{formatPrice(dish.price)}</Text>
        <View style={styles.stockRow}>
          <MaterialIcons
            name={Number(dish.stock) > 0 ? 'check-circle' : 'cancel'}
            size={16}
            color={Number(dish.stock) > 0 ? COLORS.success : COLORS.error}
          />
          <Text
            style={[
              styles.stockText,
              { color: Number(dish.stock) > 0 ? COLORS.success : COLORS.error },
            ]}
          >
            {Number(dish.stock) > 0
              ? `Disponible (${dish.stock} en stock)`
              : 'Agotado'}
          </Text>
        </View>
      </Card>

      <Button
        title="Escribir reseña"
        variant="secondary"
        onPress={() => setReviewModalVisible(true)}
        style={styles.reviewButton}
      />

      <Text style={styles.sectionTitle}>Reseñas</Text>

      {loading ? (
        <LoadingSpinner message="Cargando reseñas..." />
      ) : (
        <>
          {stats.total_reviews > 0 ? (
            <Card style={styles.statsCard}>
              <Text style={styles.statsRating}>
                {Number(stats.average_rating).toFixed(1)}
              </Text>
              <Stars rating={stats.average_rating} />
              <Text style={styles.statsCount}>
                {stats.total_reviews} {stats.total_reviews === 1 ? 'reseña' : 'reseñas'}
              </Text>
            </Card>
          ) : null}

          {reviews.length === 0 ? (
            <EmptyState
              icon="rate-review"
              title="Sin reseñas"
              description={error || 'Este plato aún no tiene reseñas.'}
            />
          ) : (
            reviews.map((review) => (
              <Card key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <Stars rating={review.rating} />
                  <Text style={styles.reviewDate}>{formatDate(review.created_at)}</Text>
                </View>
                {review.comment ? (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                ) : null}
              </Card>
            ))
          )}
        </>
      )}

      <ReviewFormModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleCreateReview}
        loading={reviewLoading}
        title="Reseña del platillo"
      />
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
  dishCard: {
    alignItems: 'center',
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  imageFallback: {
    width: 140,
    height: 140,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  name: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
  },
  description: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
    textAlign: 'center',
  },
  price: {
    marginTop: SPACING.sm,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.accent,
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  stockText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  reviewButton: {
    marginTop: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  statsCard: {
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  statsRating: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '700',
    color: COLORS.text,
  },
  statsCount: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  starsRow: {
    flexDirection: 'row',
  },
  reviewCard: {
    marginBottom: SPACING.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reviewDate: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  reviewComment: {
    marginTop: SPACING.xs,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
  },
});
