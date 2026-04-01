import { apiFetch } from './api';

export const login = async (email, password, role) => {
  try {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const signup = async (name, email, password, role) => {
  try {
    const data = await apiFetch('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
    localStorage.setItem('token', data.token);
    localStorage.setItem('currentUser', JSON.stringify(data.user));
    return { success: true, user: data.user };
  } catch (err) {
    return { success: false, message: err.message };
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};

export const getToken = () => localStorage.getItem('token');
