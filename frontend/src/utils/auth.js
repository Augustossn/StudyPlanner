export const getAuthUser = () => {
  const saved = localStorage.getItem('user') || sessionStorage.getItem('user');
  return saved ? JSON.parse(saved) : null;
};

export const isAuthenticated = () => {
  const user = getAuthUser();
  return user && user.token; // Só é válido se tiver o token
};

export const logout = () => {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
  window.location.href = '/';
};