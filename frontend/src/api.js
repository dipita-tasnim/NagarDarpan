import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const signup = (data) => API.post('/auth/signup', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Problems
export const createProblem = (data) => API.post('/problems', data);
export const getAllProblems = (params) => API.get('/problems', { params });
export const getMyProblems = () => API.get('/problems/my');
export const getProblemById = (id) => API.get(`/problems/${id}`);
export const getProblemByReference = (ref) => API.get(`/problems/reference/${ref}`);
export const getProblemStatus = (id) => API.get(`/problems/${id}/status`);
export const getProblemTimeline = (id) => API.get(`/problems/${id}/timeline`);
export const updateProblemStatus = (id, data) => API.put(`/problems/${id}/status`, data);
export const supportProblem = (id) => API.post(`/problems/${id}/support`);
export const escalateProblem = (id) => API.post(`/problems/${id}/escalate`);
export const deleteProblem = (id) => API.delete(`/problems/${id}`);
export const getAreaStats = (params) => API.get('/problems/stats', { params });
export const checkSimilarProblems = (params) => API.get('/problems/similar', { params });

// Admin - Problems
export const getAdminProblems = (params) => API.get('/problems/admin/all', { params });
export const moderateProblem = (id, data) => API.put(`/problems/admin/${id}/moderate`, data);
export const toggleFraudProblem = (id) => API.put(`/problems/${id}/fraud`);

// Admin - Dashboard & Users
export const getDashboardStats = () => API.get('/admin/dashboard-stats');
export const getAdminUsers = (params) => API.get('/admin/users', { params });
export const updateUserStatus = (id, data) => API.put(`/admin/users/${id}/status`, data);
export const warnUser = (id) => API.post(`/admin/users/${id}/warn`);

// Admin - Fraud
export const getFraudProblems = () => API.get('/admin/fraud-problems');
export const getFraudStats = () => API.get('/admin/fraud-stats');
export const runFraudScan = () => API.post('/admin/fraud/scan');
export const rejectProblem = (id) => API.post(`/admin/problems/${id}/reject`);

// Admin - After Image Upload (proof of fix)
export const adminUploadAfterImage = (id, data) => API.post(`/admin/problems/${id}/after-image`, data);

// Admin - Authorities
export const getAuthorities = () => API.get('/admin/authorities');
export const createAuthority = (data) => API.post('/admin/authorities', data);
export const updateAuthority = (id, data) => API.put(`/admin/authorities/${id}`, data);
export const deleteAuthority = (id) => API.delete(`/admin/authorities/${id}`);

// Admin - Content
export const getContent = (params) => API.get('/admin/content', { params });
export const createContent = (data) => API.post('/admin/content', data);
export const updateContent = (id, data) => API.put(`/admin/content/${id}`, data);
export const deleteContent = (id) => API.delete(`/admin/content/${id}`);

// Admin - Notifications
export const getAdminNotifications = () => API.get('/admin/notifications');
export const createNotification = (data) => API.post('/admin/notifications', data);
export const deleteNotification = (id) => API.delete(`/admin/notifications/${id}`);

// Chatbot
export const sendChatMessage = (message, history) => API.post('/chat', { message, history });

// Areas
export const getDivisions = () => API.get('/divisions');
export const createDivision = (data) => API.post('/divisions', data);
export const getDistricts = (divisionId) => API.get(`/districts/${divisionId}`);
export const createDistrict = (data) => API.post('/districts', data);
export const getThanas = (districtId) => API.get(`/thanas/${districtId}`);
export const createThana = (data) => API.post('/thanas', data);

export default API;
