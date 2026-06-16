import axios from '../utils/axios.js';
import { useAuthStore } from '../../features/auth/store/authStore.js';

const axiosAuth = axios.create({
  baseURL: import.meta.env.VITE_AUTH_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const axiosAdmin = axios.create({
  baseURL: import.meta.env.VITE_ADMIN_URL,
  timeout: 30000, // 30s para uploads a Cloudinary
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Interceptores de request ──────────────────────────────────

axiosAdmin.interceptors.request.use((config) => {
  config._axiosClient = 'admin';
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Si es FormData, dejar que el browser ponga el Content-Type con el boundary
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

axiosAuth.interceptors.request.use((config) => {
  config._axiosClient = 'auth';
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  return config;
});

// ── Refresh token ─────────────────────────────────────────────

let _isRefreshing = false;
let failedQueue = [];

function _processQueue(error, token = null) {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  failedQueue = [];
}

const handleRefreshToken = async (_error) => {
  const original = _error.config;

  if (!original || original._retry) return Promise.reject(_error);

  const status      = _error.response?.status;
  const errorCode   = _error.response?.data?.error;
  const isRefreshEp = (original.url || '').includes('/auth/refresh');

  const shouldRefresh =
    !isRefreshEp &&
    (status === 401 || (status === 403 && errorCode === 'TOKEN_EXPIRED'));

  if (!shouldRefresh) return Promise.reject(_error);

  const retryClient = original._axiosClient === 'admin' ? axiosAdmin : axiosAuth;

  // Si ya hay un refresh en curso, encolar
  if (_isRefreshing) {
    return new Promise((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    }).then((token) => {
      original.headers['Authorization'] = `Bearer ${token}`;
      return retryClient(original);
    });
  }

  original._retry = true;
  _isRefreshing   = true;

  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) {
    useAuthStore.getState().logout();
    return Promise.reject(_error);
  }

  try {
    const response = await axiosAuth.post('/auth/refresh', { refreshToken });
    const { accessToken, refreshToken: newRefreshToken, expiresIn, userDetails } = response.data;

    useAuthStore.setState({
      token:           accessToken,
      refreshToken:    newRefreshToken,
      expiresAt:       expiresIn,
      user:            userDetails || useAuthStore.getState().user,
      isAuthenticated: true,
    });

    _processQueue(null, accessToken);
    original.headers['Authorization'] = `Bearer ${accessToken}`;
    return retryClient(original);
  } catch (err) {
    _processQueue(err, null);
    useAuthStore.getState().logout();
    return Promise.reject(err);
  } finally {
    _isRefreshing = false;
  }
};

axiosAuth.interceptors.response.use((res) => res, handleRefreshToken);
axiosAdmin.interceptors.response.use((res) => res, handleRefreshToken);

export { axiosAdmin, axiosAuth, handleRefreshToken };