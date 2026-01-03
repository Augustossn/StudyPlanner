import axios from 'axios';
import { getAuthUser } from '../utils/auth';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const user = getAuthUser();
  if (user && (user.token || user.accessToken)) {
    const token = user.token || user.accessToken;
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Auth API
export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  register: (name, email, password) => 
    api.post('/auth/register', { name, email, password }),

  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),

  validateCode: (email, code) =>
    api.post('/auth/validate-code', { email, code }),

  resetPassword: (email, code, newPassword) =>
    api.post('/auth/reset-password', { email, code, newPassword }),

};

// Dashboard API
export const dashboardAPI = {
  getStats: (userId) => 
    api.get(`/dashboard/stats/${userId}`),
};

// Study Sessions API
export const studySessionAPI = {
  getUserSessions: (userId) => 
    api.get(`/study-sessions/user/${userId}`),
  
  getRecentSessions: (userId) => 
    api.get(`/study-sessions/user/${userId}/recent`),
  
  createSession: (session) => 
    api.post('/study-sessions', session),

  updateSession: (id, session) =>
    api.put(`/study-sessions/${id}`, session),
  
  deleteSession: (id) => 
    api.delete(`/study-sessions/${id}`),
};

// Goals API
export const goalsAPI = {
  getUserGoals: (userId) => 
    api.get(`/goals/user/${userId}`),
  
  createGoal: (goal) => 
    api.post('/goals', goal),
  
  updateGoal: (id, goal) => 
    api.put(`/goals/${id}`, goal),
  
  deleteGoal: (id) => 
    api.delete(`/goals/${id}`),
};

// Subjects API (CORRIGIDO: Removido o 's' para bater com os imports dos modais)
export const subjectAPI = {
  getUserSubjects: (userId) => 
    api.get(`/subjects/user/${userId}`),
  
  createSubject: (subject) => 
    api.post('/subjects', subject),

  updateSubject: (id, subject) =>
    api.put(`/subjects/${id}`, subject),
  
  deleteSubject: (id) => 
    api.delete(`/subjects/${id}`),
};

export default api;