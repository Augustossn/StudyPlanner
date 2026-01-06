// src/utils/errorHandler.js

export const getErrorMessage = (error) => {
  // 1. Erro de Conexão (Servidor desligado ou sem internet)
  if (!error.response) {
    return "Não foi possível conectar ao servidor. Verifique sua internet ou tente mais tarde.";
  }

  const { status, data } = error.response;

  // 2. Mensagem personalizada vinda do Backend (se houver)
  // Se o seu Java mandar: throw new RuntimeException("Matéria duplicada!");
  // O axios pega aqui: data.message ou data
  if (data && typeof data === 'string') return data;
  if (data && data.message) return data.message;

  // 3. Tradução baseada no Código de Status (HTTP Status)
  switch (status) {
    case 400:
      return "Dados inválidos. Verifique se preencheu todos os campos corretamente e se está tudo certo com o servidor.";
    case 401:
      return "Sessão expirada. Por favor, faça login novamente.";
    case 403:
      return "Você não tem permissão para realizar esta ação.";
    case 404:
      return "O recurso solicitado não foi encontrado (404).";
    case 409:
      return "Conflito: Este item já existe no sistema.";
    case 500:
      return "Erro interno no servidor. Nossa equipe já foi notificada.";
    default:
      return "Ocorreu um erro inesperado. Tente novamente.";
  }
};