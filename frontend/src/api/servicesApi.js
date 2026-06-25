import axios from 'axios';
import { API_BASE_URL, getAuthHeader } from './config';

const api = axios.create({ baseURL: API_BASE_URL });

api.interceptors.request.use((config) => {
  Object.assign(config.headers, getAuthHeader());
  return config;
});

export const login = (email, password, role) =>
  api.post('/api/v1/auth/login', { email, password, role }).then((r) => r.data);

export const getCategories = () =>
  api.get('/api/v1/categories').then((r) => r.data);

export const getMyServices = (params) =>
  api.get('/api/v1/services/my', { params }).then((r) => r.data);

export const getService = (id) =>
  api.get(`/api/v1/services/${id}`).then((r) => r.data);

export const createService = (data) =>
  api.post('/api/v1/services', data).then((r) => r.data);

export const updateService = (id, data) =>
  api.put(`/api/v1/services/${id}`, data);

export const deleteService = (id) =>
  api.delete(`/api/v1/services/${id}`).then((r) => r.data);

export const publishService = (id) =>
  api.post(`/api/v1/services/${id}/publish`).then((r) => r.data);

export const unpublishService = (id) =>
  api.post(`/api/v1/services/${id}/unpublish`).then((r) => r.data);

export const uploadImage = (serviceId, imageUri, mimeType = 'image/jpeg') => {
  const formData = new FormData();
  const filename = imageUri.split('/').pop();
  formData.append('image', { uri: imageUri, name: filename, type: mimeType });
  return api
    .post(`/api/v1/services/${serviceId}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    .then((r) => r.data);
};

export const deleteImage = (serviceId, imageId) =>
  api.delete(`/api/v1/services/${serviceId}/images/${imageId}`);
