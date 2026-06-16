// client-user/src/features/profile/screens/ProfileScreen.jsx
import { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../auth/hooks/useAuth';
import ReviewFormModal from '../../reviews/components/ReviewFormModal';
import { useReviews } from '../../reviews/hooks/useReviews';
import Button from '../../../shared/components/common/Button';
import Input from '../../../shared/components/common/Input';
import { Card, EmptyState, LoadingSpinner } from '../../../shared/components/common/Common';
import { COLORS, FONT_SIZE, SPACING } from '../../../shared/constants/theme';
import { useAuthStore } from '../../../shared/store/authStore';
import { useProfile } from '../hooks/useProfile';
import { useManagerStore } from '../../manager/store/useManagerStore';

const avatarDefault = require('../../../../assets/avatarDefault.png');

/** Resuelve la fuente del avatar: URL http(s) o imagen local por defecto. */
function getAvatarSource(profilePicture) {
  const uri = profilePicture?.trim();
  if (uri && uri.startsWith('http')) {
    return { uri };
  }
  return avatarDefault;
}

function Stars({ rating }) {
  const rounded = Math.round(Number(rating) || 0);
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((star) => (
        <MaterialIcons
          key={star}
          name={star <= rounded ? 'star' : 'star-border'}
          size={16}
          color={COLORS.warning}
        />
      ))}
    </View>
  );
}

export default function ProfileScreen() {
  const storeUser = useAuthStore((state) => state.user);
  const { logout } = useAuth();
  const { loading: profileLoading, error: profileError, fetchProfile, updateProfile } =
    useProfile();
  const {
    loading: reviewsLoading,
    getMyReviews,
    updateReview,
    deleteReview,
  } = useReviews();

  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [editReview, setEditReview] = useState(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { name: '', surname: '', phone: '' },
  });

  const loadProfile = useCallback(async () => {
    const data = await fetchProfile();
    if (data) {
      setProfile(data);
      reset({
        name: data.name || '',
        surname: data.surname || '',
        phone: data.phone || '',
      });
    }
  }, [fetchProfile, reset]);

  const loadReviews = useCallback(async () => {
    const list = await getMyReviews();
    setReviews(list);
  }, [getMyReviews]);

  useEffect(() => {
    loadProfile();
    loadReviews();
  }, [loadProfile, loadReviews]);

  useFocusEffect(
    useCallback(() => {
      loadReviews();
    }, [loadReviews]),
  );

  const onSaveProfile = async (values) => {
    const result = await updateProfile(values);
    if (result.success) {
      setProfile(result.data);
      setEditing(false);
      Alert.alert('Perfil actualizado', 'Tus datos se guardaron correctamente.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Cerrar sesión', '¿Seguro que deseas salir de tu cuenta?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesión',
        style: 'destructive',
        onPress: async () => {
          useManagerStore.getState().clearRestaurant();
          await logout();
        },
      },
    ]);
  };

  const handleDeleteReview = (review) => {
    const target = review.restaurant_name || review.dish_name || 'esta reseña';
    Alert.alert('Eliminar reseña', `¿Eliminar tu reseña de ${target}?`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          const result = await deleteReview(review.id);
          if (result.success) loadReviews();
          else Alert.alert('Error', result.error);
        },
      },
    ]);
  };

  const handleUpdateReview = async ({ rating, comment }) => {
    if (!editReview) return;
    const result = await updateReview(editReview.id, { rating, comment });
    if (result.success) {
      setEditReview(null);
      loadReviews();
      Alert.alert('Reseña actualizada', 'Los cambios se guardaron correctamente.');
    }
  };

  const displayProfile = profile || storeUser;
  const avatarUri = displayProfile?.profilePicture || storeUser?.profilePicture;

  if (profileLoading && !profile && !storeUser) {
    return <LoadingSpinner message="Cargando perfil..." />;
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Card style={styles.profileCard}>
          <Image source={getAvatarSource(avatarUri)} style={styles.avatar} />
          <Text style={styles.username}>
            {displayProfile?.username || storeUser?.username || 'Usuario'}
          </Text>
          {displayProfile?.email || storeUser?.email ? (
            <Text style={styles.email}>{displayProfile?.email || storeUser?.email}</Text>
          ) : null}

          {!editing ? (
            <>
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Nombre</Text>
                <Text style={styles.infoValue}>
                  {displayProfile?.name || '—'} {displayProfile?.surname || ''}
                </Text>
              </View>
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Teléfono</Text>
                <Text style={styles.infoValue}>{displayProfile?.phone || '—'}</Text>
              </View>
              <Button
                title="Editar perfil"
                variant="secondary"
                onPress={() => setEditing(true)}
                style={styles.editButton}
              />
            </>
          ) : (
            <>
              <Controller
                control={control}
                name="name"
                rules={{ required: 'El nombre es obligatorio' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Nombre"
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
                rules={{ required: 'El apellido es obligatorio' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <Input
                    label="Apellido"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    error={errors.surname?.message}
                  />
                )}
              />
              <Controller
                control={control}
                name="phone"
                rules={{
                  pattern: {
                    value: /^\d{8}$/,
                    message: 'El teléfono debe tener 8 dígitos',
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
              {profileError ? <Text style={styles.apiError}>{profileError}</Text> : null}
              <View style={styles.editActions}>
                <Button
                  title="Cancelar"
                  variant="secondary"
                  onPress={() => {
                    setEditing(false);
                    reset({
                      name: profile?.name || '',
                      surname: profile?.surname || '',
                      phone: profile?.phone || '',
                    });
                  }}
                  style={styles.editActionBtn}
                />
                <Button
                  title="Guardar"
                  loading={profileLoading}
                  onPress={handleSubmit(onSaveProfile)}
                  style={styles.editActionBtn}
                />
              </View>
            </>
          )}
        </Card>

        <Text style={styles.sectionTitle}>Mis reseñas</Text>

        {reviewsLoading && reviews.length === 0 ? (
          <LoadingSpinner message="Cargando reseñas..." />
        ) : reviews.length === 0 ? (
          <EmptyState
            icon="rate-review"
            title="Sin reseñas"
            description="Aún no has escrito reseñas. Visita un restaurante o platillo para dejar la tuya."
          />
        ) : (
          reviews.map((review) => (
            <Card key={review.id} style={styles.reviewCard}>
              <Text style={styles.reviewTarget} numberOfLines={1}>
                {review.restaurant_name || review.dish_name || 'Reseña'}
              </Text>
              <Stars rating={review.rating} />
              {review.comment ? (
                <Text style={styles.reviewComment} numberOfLines={3}>
                  {review.comment}
                </Text>
              ) : null}
              <View style={styles.reviewActions}>
                <Pressable
                  style={styles.reviewAction}
                  onPress={() => setEditReview(review)}
                >
                  <MaterialIcons name="edit" size={16} color={COLORS.accent} />
                  <Text style={styles.reviewActionText}>Editar</Text>
                </Pressable>
                <Pressable
                  style={styles.reviewAction}
                  onPress={() => handleDeleteReview(review)}
                >
                  <MaterialIcons name="delete" size={16} color={COLORS.error} />
                  <Text style={[styles.reviewActionText, { color: COLORS.error }]}>
                    Eliminar
                  </Text>
                </Pressable>
              </View>
            </Card>
          ))
        )}

        <Button
          title="Cerrar sesión"
          variant="secondary"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </ScrollView>

      <ReviewFormModal
        visible={Boolean(editReview)}
        onClose={() => setEditReview(null)}
        onSubmit={handleUpdateReview}
        loading={reviewsLoading}
        title="Editar reseña"
        initialRating={editReview?.rating ?? 5}
        initialComment={editReview?.comment ?? ''}
      />
    </>
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
  profileCard: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.sm,
  },
  username: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
  },
  email: {
    marginTop: 2,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textLight,
  },
  infoBlock: {
    alignSelf: 'stretch',
    marginTop: SPACING.sm,
  },
  infoLabel: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textLight,
  },
  infoValue: {
    fontSize: FONT_SIZE.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  editButton: {
    marginTop: SPACING.md,
    alignSelf: 'stretch',
  },
  editActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    alignSelf: 'stretch',
  },
  editActionBtn: {
    flex: 1,
  },
  apiError: {
    marginBottom: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.error,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  reviewCard: {
    marginBottom: SPACING.sm,
  },
  reviewTarget: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  starsRow: {
    flexDirection: 'row',
    marginBottom: SPACING.xs,
  },
  reviewComment: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.secondary,
  },
  reviewActions: {
    flexDirection: 'row',
    gap: SPACING.lg,
    marginTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  reviewAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reviewActionText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    color: COLORS.accent,
  },
  logoutButton: {
    marginTop: SPACING.lg,
  },
});
