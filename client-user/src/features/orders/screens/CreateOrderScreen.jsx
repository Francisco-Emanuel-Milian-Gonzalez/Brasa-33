// client-user/src/features/orders/screens/CreateOrderScreen.jsx
import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../../shared/components/common/Button';
import { Card, EmptyState } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useOrders } from '../hooks/useOrders';

const formatPrice = (value) => `Q${Number(value || 0).toFixed(2)}`;

export default function CreateOrderScreen({ navigation, route }) {
  // Items recibidos desde RestaurantDetail: [{ menu_id, name, price, quantity, stock }]
  const { items: initialItems = [], restaurantId, restaurantName } = route.params || {};
  const [items, setItems] = useState(initialItems);
  const { createOrder, loading, error } = useOrders();

  // Sincroniza el carrito cuando se navega desde RestaurantDetail con nuevos params.
  useFocusEffect(
    useCallback(() => {
      if (route.params?.items?.length) {
        setItems(route.params.items);
      }
    }, [route.params?.items]),
  );

  const changeQty = (menuId, delta) => {
    setItems((prev) =>
      prev
        .map((item) =>
          item.menu_id === menuId
            ? { ...item, quantity: Math.min(item.stock ?? Infinity, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    const result = await createOrder(items, { restaurant_id: restaurantId });
    if (result.success) {
      Alert.alert('Orden creada', 'Tu orden fue registrada y está pendiente.', [
        { text: 'Aceptar', onPress: () => navigation.navigate('OrdersList') },
      ]);
    }
  };

  if (items.length === 0) {
    return (
      <EmptyState
        icon="shopping-cart"
        title="Carrito vacío"
        description="Agrega platos desde el menú de un restaurante para crear una orden."
      >
        <Button
          title="Ver restaurantes"
          onPress={() => navigation.navigate('Restaurants')}
        />
      </EmptyState>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => String(item.menu_id)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          restaurantName ? (
            <Text style={styles.subtitle}>Orden en {restaurantName}</Text>
          ) : null
        }
        renderItem={({ item }) => (
          <Card style={styles.itemCard}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemPrice}>
                {formatPrice(item.price)} c/u · {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
            <View style={styles.qtyControls}>
              <Pressable style={styles.qtyButton} onPress={() => changeQty(item.menu_id, -1)}>
                <MaterialIcons name="remove" size={18} color={COLORS.accent} />
              </Pressable>
              <Text style={styles.qtyText}>{item.quantity}</Text>
              <Pressable
                style={[
                  styles.qtyButton,
                  item.quantity >= (item.stock ?? Infinity) && styles.qtyButtonDisabled,
                ]}
                onPress={() => changeQty(item.menu_id, 1)}
                disabled={item.quantity >= (item.stock ?? Infinity)}
              >
                <MaterialIcons
                  name="add"
                  size={18}
                  color={
                    item.quantity >= (item.stock ?? Infinity)
                      ? COLORS.textLight
                      : COLORS.accent
                  }
                />
              </Pressable>
            </View>
          </Card>
        )}
      />
      <View style={styles.footer}>
        {error ? <Text style={styles.apiError}>{error}</Text> : null}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(total)}</Text>
        </View>
        <Button title="Confirmar orden" loading={loading} onPress={handleSubmit} />
      </View>
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
    flexGrow: 1,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: SPACING.sm,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
  },
  itemPrice: {
    marginTop: 2,
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
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
  apiError: {
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    textAlign: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  totalLabel: {
    fontSize: FONT_SIZE.md,
    color: COLORS.secondary,
  },
  totalValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.accent,
  },
});
