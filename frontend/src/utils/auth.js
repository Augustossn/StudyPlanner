export const getAuthUser = () => {
  // 1. Tenta pegar do LocalStorage
  const localUser = localStorage.getItem('user');
  
  if (localUser) {
    try {
      const parsed = JSON.parse(localUser);
      // SÓ retorna se tiver token. Se não tiver token, considera inválido e tenta o próximo.
      if (parsed && (parsed.token || parsed.accessToken)) {
        console.log("Auth: Usuário válido encontrado no LocalStorage");
        return parsed;
      }
      console.warn("Auth: Usuário encontrado no LocalStorage, mas SEM TOKEN (Lixo). Ignorando...");
    } catch (e) {
      console.error("Auth: Erro ao ler LocalStorage", e);
    }
  }

  // 2. Se não achou válido no Local, tenta SessionStorage
  const sessionUser = sessionStorage.getItem('user');
  if (sessionUser) {
    try {
      const parsed = JSON.parse(sessionUser);
      if (parsed && (parsed.token || parsed.accessToken)) {
        console.log("Auth: Usuário válido encontrado no SessionStorage");
        return parsed;
      }
    } catch (e) {
      console.error("Auth: Erro ao ler SessionStorage", e);
    }
  }

  console.log("Auth: Nenhum usuário logado encontrado.");
  return null;
};

export const isAuthenticated = () => {
  const user = getAuthUser();
  return !!user; // Se getAuthUser retornou algo, é porque tem token
};

export const logout = () => {
  localStorage.removeItem('user');
  sessionStorage.removeItem('user');
  window.location.href = '/';
};