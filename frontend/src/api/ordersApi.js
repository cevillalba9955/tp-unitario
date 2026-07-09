import axios from 'axios';
import { API_BASE_URL, getAuthHeader } from './config';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  Object.assign(config.headers, getAuthHeader());
  return config;
});

// Contratar un paquete de un servicio (US1)
export const createOrder = (serviceId, packageId) =>
  api.post('/api/v1/orders', { serviceId, packageId }).then((r) => r.data);

// Mis pedidos. El backend filtra según el rol del token; `role` es informativo para la vista.
export const getOrders = (role) =>
  api.get('/api/v1/orders').then((r) => r.data.data);

// Detalle de un pedido con su historial
export const getOrder = (id) =>
  api.get(`/api/v1/orders/${id}`).then((r) => r.data);

// Aplicar una acción del ciclo de vida (accept, reject, deliver, accept_delivery, request_changes, cancel)
export const transitionOrder = (id, action) =>
  api.post(`/api/v1/orders/${id}/transition`, { action }).then((r) => r.data);
