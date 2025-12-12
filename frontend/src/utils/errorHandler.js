export const getErrorMessage = (error) => {
    // 1. Se o Backend mandou uma mensagem específica (ex: "Data inválida")
    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    // 2. Se o Backend mandou uma lista de erros de validação (comum no Spring Validation)
    if (error.response?.data?.errors && error.response.data.errors.length > 0) {
        return error.response.data.errors[0].defaultMessage; // Pega o primeiro erro
    }

    // 3. Se for erro de conexão/rede (sem resposta do servidor)
    if (error.message) {
        return error.message;
    }

    // 4. Fallback genérico
    return "Ocorreu um erro inesperado. Tente novamente.";
};