import { getDb, saveDb } from './mockDb';

export const login = (email, password, role) => {
  const db = getDb();
  const user = db.users.find(u => u.email === email && u.password === password && u.role === role);
  if (user) {
    localStorage.setItem('currentUser', JSON.stringify({ id: user.id, name: user.name, role: user.role }));
    return { success: true, user };
  }
  return { success: false, message: 'Invalid credentials or role' };
};

export const signup = (name, email, password, role) => {
  const db = getDb();
  if (db.users.find(u => u.email === email)) {
    return { success: false, message: 'Email already exists' };
  }
  const newUser = { id: Date.now().toString(), name, email, password, role };
  db.users.push(newUser);
  saveDb(db);
  localStorage.setItem('currentUser', JSON.stringify({ id: newUser.id, name: newUser.name, role: newUser.role }));
  return { success: true, user: newUser };
};

export const logout = () => {
  localStorage.removeItem('currentUser');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('currentUser');
  return user ? JSON.parse(user) : null;
};
