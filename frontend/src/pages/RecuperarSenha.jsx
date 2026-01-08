import { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { authAPI } from '../services/api'; // Importamos o objeto, agora precisamos usá-lo

const RecuperarSenha = () => {
    const navigate = useNavigate();

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [password, setPassword] = useState('');

    const handleSendEmail = async (e) => {
        e.preventDefault();
        setLoading(true);
        try{
            // CORREÇÃO AQUI: authAPI.forgotPassword
            await authAPI.forgotPassword(email); 
            toast.success('Código enviado! Verifique seu email (console do backend).');
            setStep(2);
        } catch (error) {
            console.error(error); // Bom para ver o erro real no console do navegador
            toast.error('Erro ao enviar código. Verifique o email.');
        } finally {
            setLoading(false);
        }
    };

    const handleValidateCode = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.validateCode(email, code);
            toast.success('Código validado com sucesso!');
            setStep(3);
        } catch (error) {
            console.error("Erro na validação:", error);
            // Pega a mensagem do backend ou usa uma genérica
            const mensagemErro = error.response?.data || "Ocorreu um erro inesperado.";
            toast.error(mensagemErro);
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authAPI.resetPassword(email, code, password);
            toast.success('Senha alterada com sucesso! Faça login.');
            navigate('/');
        } catch (error) {
            // CORREÇÃO VISUAL: Ajustei o texto do log para condizer com a função
            console.error("Erro ao resetar senha:", error);
            
            const mensagemErro = error.response?.data || "Ocorreu um erro inesperado.";
            toast.error(mensagemErro);
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="min-h-screen bg-[#121214] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#202024] p-8 rounded-lg border border-border shadow-xl">
        
        <h2 className="text-2xl font-bold text-text mb-6 text-center">
          {step === 1 && 'Recuperar Senha'}
          {step === 2 && 'Digite o Código'}
          {step === 3 && 'Criar Nova Senha'}
        </h2>

        {/* --- FORMULÁRIO ETAPA 1 (EMAIL) --- */}
        {step === 1 && (
          <form onSubmit={handleSendEmail} className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#121214] border border-border rounded p-3 text-text focus:outline-none focus:border-blue-500"
                placeholder="seu@email.com"
                required
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-text font-bold py-3 rounded transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Enviando...' : 'Enviar Código'}
            </button>
          </form>
        )}

        {/* --- FORMULÁRIO ETAPA 2 (CÓDIGO) --- */}
        {step === 2 && (
          <form onSubmit={handleValidateCode} className="space-y-4">
            <p className="text-sm text-text-muted text-center">
              Enviamos um código de 6 dígitos para <strong>{email}</strong>
            </p>
            <div>
              <label className="block text-sm text-text-muted mb-1">Código de Verificação</label>
              <input 
                type="text" 
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-[#121214] border border-border rounded p-3 text-text text-center text-2xl tracking-widest focus:outline-none focus:border-blue-500"
                maxLength={6}
                placeholder="000000"
                required
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-text font-bold py-3 rounded transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Validando...' : 'Validar Código'}
            </button>
          </form>
        )}

        {/* --- FORMULÁRIO ETAPA 3 (NOVA SENHA) --- */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm text-text-muted mb-1">Nova Senha</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#121214] border border-border rounded p-3 text-text focus:outline-none focus:border-blue-500"
                placeholder="Digite sua nova senha"
                required
                minLength={6}
              />
            </div>
            <button 
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-text font-bold py-3 rounded transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Salvando...' : 'Alterar Senha'}
            </button>
          </form>
        )}

        {/* Botão de voltar para Login */}
        <div className="mt-6 text-center">
          <button 
            type="button" // Importante: type="button" para não submeter o formulário ao clicar
            onClick={() => navigate('/')}
            className="text-sm text-text-muted hover:text-text transition"
          >
            Voltar para Login
          </button>
        </div>

      </div>
    </div>
  );
}

export default RecuperarSenha;