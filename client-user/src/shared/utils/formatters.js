// client-user/src/shared/utils/formatters.js
export const formatPrice = (value) => `Q${Number(value || 0).toFixed(2)}`;

export const formatDate = (value, options = {}) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString('es', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: options.time ? '2-digit' : undefined,
    minute: options.time ? '2-digit' : undefined,
  });
};
