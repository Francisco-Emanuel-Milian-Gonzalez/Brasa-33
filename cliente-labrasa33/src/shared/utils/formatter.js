export const formatDate = (isoString) => {
  if (!isoString) return '—';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('es-GT', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatPrice = (amount) => `Q${Number(amount || 0).toFixed(2)}`;

export const formatTime = (isoString) => {
  const date = new Date(isoString);
  return date.toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateForInput = (isoString) => {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // muestra meses 01 - 12
  const day = String(date.getDate()).padStart(2, '0'); // muestra días 01 - 31
  return `${year}-${month}-${day}`;
};
