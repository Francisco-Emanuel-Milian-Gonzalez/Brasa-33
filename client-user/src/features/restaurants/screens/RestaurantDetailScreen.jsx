// client-user/src/features/restaurants/screens/RestaurantDetailScreen.jsx
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import ReviewFormModal from '../../reviews/components/ReviewFormModal';
import { useReviews } from '../../reviews/hooks/useReviews';
import Button from '../../../shared/components/common/Button';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useRestaurants } from '../hooks/useRestaurants';

const formatPrice = (value) => `Q${Number(value || 0).toFixed(2)}`;

function DishCard({ dish, quantity, onPress, onAdd, onRemove }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.dishCard}>
        {dish.image_url ? (
          <Image source={{ uri: dish.image_url }} style={styles.dishImage} />
        ) : (
          <View style={styles.dishImageFallback}>
            <MaterialIcons name="restaurant-menu" size={24} color={COLORS.accent} />
          </View>
        )}
        <View style={styles.dishInfo}>
          <Text style={styles.dishName} numberOfLines={1}>
            {dish.name}
          </Text>
          <Text style={styles.dishPrice}>{formatPrice(dish.price)}</Text>
          {Number(dish.stock) <= 0 ? (
            <Text style={styles.outOfStock}>Agotado</Text>
          ) : null}
        </View>
        {Number(dish.stock) > 0 ? (
          <View style={styles.qtyControls}>
            <Pressable
              onPress={onRemove}
              style={[styles.qtyButton, quantity === 0 && styles.qtyButtonDisabled]}
              disabled={quantity === 0}
            >
              <MaterialIcons
                name="remove"
                size={18}
                color={quantity === 0 ? COLORS.textLight : COLORS.accent}
              />
            </Pressable>
            <Text style={styles.qtyText}>{quantity}</Text>
            <Pressable
              onPress={onAdd}
              style={[
                styles.qtyButton,
                quantity >= Number(dish.stock) && styles.qtyButtonDisabled,
              ]}
              disabled={quantity >= Number(dish.stock)}
            >
              <MaterialIcons
                name="add"
                size={18}
                color={quantity >= Number(dish.stock) ? COLORS.textLight : COLORS.accent}
              />
            </Pressable>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

export default function RestaurantDetailScreen({ navigation, route }) {
  const { restaurantId } = route.params;
  const { restaurant, dishes, loading, error, fetchRestaurantDetail } = useRestaurants();
  const { loading: reviewLoading, createReview } = useReviews();
  // Carrito local: { [menuId]: cantidad }
  const [cart, setCart] = useState({});
  const [reviewModalVisible, setReviewModalVisible] = useState(false);

  useEffect(() => {
    fetchRestaurantDetail(restaurantId);
  }, [fetchRestaurantDetail, restaurantId]);

  const changeQty = useCallback((menuId, delta) => {
    setCart((prev) => {
      const next = Math.max(0, (prev[menuId] || 0) + delta);
      const updated = { ...prev };
      if (next === 0) {
        delete updated[menuId];
      } else {
        updated[menuId] = next;
      }
      return updated;
    });
  }, []);

  const itemCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);

  const goToCreateOrder = () => {
    const items = dishes
      .filter((dish) => cart[dish.id])
      .map((dish) => ({
        menu_id: dish.id,
        name: dish.name,
        price: Number(dish.price),
        quantity: cart[dish.id],
        stock: Number(dish.stock),
      }));
    navigation.navigate('Orders', {
      screen: 'CreateOrder',
      params: { items, restaurantId, restaurantName: restaurant?.name },
    });
    setCart({});
  };

  const goToCreateReservation = () => {
    navigation.navigate('Reservations', {
      screen: 'CreateReservation',
      params: { restaurantId, restaurantName: restaurant?.name },
    });
  };

  const handleCreateReview = async ({ rating, comment }) => {
    const result = await createReview({
      restaurant_id: restaurantId,
      menu_id: null,
      rating,
      comment,
    });
    if (result.success) {
      setReviewModalVisible(false);
      Alert.alert('Reseña publicada', 'Gracias por compartir tu experiencia.');
      fetchRestaurantDetail(restaurantId);
    } else {
      Alert.alert('Error', result.error);
    }
  };

  if (loading && !restaurant) {
    return <LoadingSpinner message="Cargando restaurante..." />;
  }

  if (error && !restaurant) {
    return <EmptyState icon="error-outline" title="Error al cargar" description={error} />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={dishes}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View>
            <Card style={styles.headerCard}>
              {restaurant?.logo_url ? (
                <Image source={{ uri: restaurant.logo_url }} style={styles.logo} />
              ) : (
                <View style={styles.logoFallback}>
                  <MaterialIcons name="restaurant" size={36} color={COLORS.accent} />
                </View>
              )}
              <Text style={styles.name}>{restaurant?.name}</Text>
              {restaurant?.description ? (
                <Text style={styles.description}>{restaurant.description}</Text>
              ) : null}
              <View style={styles.infoRow}>
                <MaterialIcons name="place" size={16} color={COLORS.textLight} />
                <Text style={styles.infoText}>{restaurant?.address}</Text>
              </View>
              {restaurant?.phone ? (
                <View style={styles.infoRow}>
                  <MaterialIcons name="phone" size={16} color={COLORS.textLight} />
                  <Text style={styles.infoText}>{restaurant.phone}</Text>
                </View>
              ) : null}
              {restaurant?.review_count > 0 ? (
                <View style={styles.infoRow}>
                  <MaterialIcons name="star" size={16} color={COLORS.warning} />
                  <Text style={styles.infoText}>
                    {Number(restaurant.average_rating).toFixed(1)} (
                    {restaurant.review_count} reseñas)
                  </Text>
                </View>
              ) : null}
              <Button
                title="Reservar mesa"
                variant="secondary"
                onPress={goToCreateReservation}
                style={styles.actionButton}
              />
              <Button
                title="Escribir reseña"
                variant="secondary"
                onPress={() => setReviewModalVisible(true)}
                style={styles.actionButton}
              />
            </Card>
            <Text style={styles.sectionTitle}>Menú</Text>
          </View>
        }
        renderItem={({ item }) => (
          <DishCard
            dish={item}
            quantity={cart[item.id] || 0}
            onPress={() => navigation.navigate('DishDetail', { dish: item })}
            onAdd={() => changeQty(item.id, 1)}
            onRemove={() => changeQty(item.id, -1)}
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="restaurant-menu"
            title="Sin platos"
            description="Este restaurante aún no tiene platos en su menú."
          />
        }
      />
      {itemCount > 0 ? (
        <View style={styles.footer}>
          <Button
            title={`Ordenar (${itemCount} ${itemCount === 1 ? 'plato' : 'platos'})`}
            onPress={goToCreateOrder}
          />
        </View>
      ) : null}

      <ReviewFormModal
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSubmit={handleCreateReview}
        loading={reviewLoading}
        title="Reseña del restaurante"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xxl,
    flexGrow: 1,
  },
  headerCard: {
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  logoFallback: {
    width: 80,
    height: 80,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: SPACING.xs,
  },
  infoText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
  },
  actionButton: {
    marginTop: SPACING.sm,
    alignSelf: 'stretch',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  dishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  dishImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.border,
  },
  dishImageFallback: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  dishInfo: {
    flex: 1,
  },
  dishName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  dishPrice: {
    marginTop: 2,
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.accent,
  },
  outOfStock: {
    marginTop: 2,
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
    fontWeight: '600',
  },
  qtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  qtyButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  qtyButtonDisabled: {
    borderColor: COLORS.border,
  },
  qtyText: {
    minWidth: 20,
    textAlign: 'center',
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
});
