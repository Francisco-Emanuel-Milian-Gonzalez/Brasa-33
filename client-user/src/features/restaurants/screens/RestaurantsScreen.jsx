// client-user/src/features/restaurants/screens/RestaurantsScreen.jsx
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../../shared/components/common/Button';
import { EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import ScreenHeader from '../../../shared/components/common/ScreenHeader';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '../../../shared/constants/theme';
import { useRestaurants } from '../hooks/useRestaurants';

function Stars({ rating, count }) {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialIcons
          key={star}
          name={star <= rounded ? 'star' : 'star-border'}
          size={14}
          color={star <= rounded ? COLORS.accent : COLORS.textLight}
        />
      ))}
      <Text style={styles.ratingText}>
        {Number(rating || 0).toFixed(1)} ({count || 0} reseñas)
      </Text>
    </View>
  );
}

function RestaurantCard({ restaurant, onViewMenu }) {
  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        {restaurant.logo_url ? (
          <Image source={{ uri: restaurant.logo_url }} style={styles.heroImage} />
        ) : (
          <View style={styles.heroFallback}>
            <MaterialIcons name="storefront" size={48} color={COLORS.textLight} />
          </View>
        )}
        <View style={styles.imageOverlay} />
        <Text style={styles.heroTitle} numberOfLines={2}>
          {restaurant.name}
        </Text>
      </View>
      <View style={styles.cardBody}>
        {restaurant.address ? (
          <View style={styles.row}>
            <MaterialIcons name="place" size={16} color={COLORS.accent} />
            <Text style={styles.address} numberOfLines={2}>
              {restaurant.address}
            </Text>
          </View>
        ) : null}
        <Stars
          rating={restaurant.avg_rating ?? restaurant.average_rating ?? 0}
          count={restaurant.review_count ?? 0}
        />
        {restaurant.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {restaurant.description}
          </Text>
        ) : null}
        <Button title="Ver menú" variant="accent" onPress={onViewMenu} style={styles.menuButton} />
      </View>
    </View>
  );
}

export default function RestaurantsScreen({ navigation }) {
  const { restaurants, loading, error, fetchRestaurants } = useRestaurants();
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      fetchRestaurants();
    }, [fetchRestaurants]),
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return restaurants;
    return restaurants.filter(
      (r) =>
        r.name?.toLowerCase().includes(term) ||
        r.address?.toLowerCase().includes(term),
    );
  }, [restaurants, search]);

  if (loading && restaurants.length === 0) {
    return <LoadingSpinner message="Cargando restaurantes..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScreenHeader
        title="Explorar restaurantes"
        subtitle="Encuentra el lugar perfecto y realiza tu pedido"
      />
      <View style={styles.searchWrap}>
        <MaterialIcons name="search" size={20} color={COLORS.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar restaurante o ubicación..."
          placeholderTextColor={COLORS.textLight}
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {search ? (
          <Pressable onPress={() => setSearch('')}>
            <MaterialIcons name="close" size={20} color={COLORS.textLight} />
          </Pressable>
        ) : null}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchRestaurants}
            colors={[COLORS.accent]}
            tintColor={COLORS.accent}
          />
        }
        renderItem={({ item }) => (
          <RestaurantCard
            restaurant={item}
            onViewMenu={() =>
              navigation.navigate('RestaurantDetail', { restaurantId: item.id })
            }
          />
        )}
        ListEmptyComponent={
          <EmptyState
            icon="restaurant"
            title={error ? 'Error al cargar' : 'No hay restaurantes'}
            description={
              error || (search ? 'No encontramos resultados para tu búsqueda.' : 'Aún no hay restaurantes disponibles.')
            }
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
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.input,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    paddingVertical: 4,
  },
  listContent: {
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl,
    flexGrow: 1,
  },
  card: {
    marginBottom: SPACING.lg,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageWrap: {
    height: 180,
    backgroundColor: COLORS.card,
    justifyContent: 'flex-end',
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
  },
  heroFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.card,
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  heroTitle: {
    position: 'absolute',
    bottom: SPACING.md,
    left: SPACING.md,
    right: SPACING.md,
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  cardBody: {
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  address: {
    flex: 1,
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
  },
  starsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    marginLeft: 4,
    fontSize: FONT_SIZE.xs,
    color: COLORS.secondary,
  },
  description: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
    lineHeight: 18,
  },
  menuButton: {
    marginTop: SPACING.xs,
  },
});
