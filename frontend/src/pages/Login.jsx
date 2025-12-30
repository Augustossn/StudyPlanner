import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { 
  GraduationCap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Check // Importei o Check
} from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // --- NOVO ESTADO: REMEMBER ME ---
  const [rememberMe, setRememberMe] = useState(false); 

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (isLogin) {
        response = await authAPI.login(formData.email, formData.password);
      } else {
        response = await authAPI.register(formData.name, formData.email, formData.password);
      }

      if (response.data) {
        const userData = JSON.stringify(response.data);
        
        // --- LÓGICA DE PERMANECER LOGADO ---
        if (rememberMe) {
            localStorage.setItem('user', userData); // Persistente
        } else {
            sessionStorage.setItem('user', userData); // Temporário (Sessão)
        }
        
        navigate('/dashboard');
      }
    } catch (err) {
      console.error("Erro no login:", err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string') setError(data);
        else if (data.message) setError(data.message);
        else setError("Falha na operação. Verifique seus dados.");
      } else {
        setError('Erro de conexão com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center p-4 relative overflow-hidden">
      
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        <div className="flex flex-col items-center justify-center mb-8 animate-fade-in-down">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20 mb-4 transform hover:scale-105 transition-transform duration-300">
            <GraduationCap className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Study<span className="text-blue-500">Planner</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sua jornada de conhecimento começa aqui</p>
        </div>

        <div className="bg-[#121212]/80 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          
          <div className="bg-[#1a1a1a] p-1 rounded-xl flex mb-8 relative">
            <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#2a2a2a] rounded-lg shadow-sm transition-all duration-300 ease-out ${isLogin ? 'left-1' : 'left-[calc(50%+4px)]'}`}
            ></div>
            <button onClick={() => { setIsLogin(true); setError(''); }} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg relative z-10 transition-colors ${isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>Login</button>
            <button onClick={() => { setIsLogin(false); setError(''); }} className={`flex-1 py-2.5 text-sm font-semibold rounded-lg relative z-10 transition-colors ${!isLogin ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>Criar Conta</button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className={`transition-all duration-300 overflow-hidden ${!isLogin ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Nome Completo</label>
                <div className="relative group">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                    <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Ex: João Silva" required={!isLogin} className="w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="seu@email.com" required className="w-full pl-12 pr-4 py-3.5 bg-[#0a0a0a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-bold uppercase mb-2 ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                <input type={showPassword ? "text" : "password"} name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" required className="w-full pl-12 pr-12 py-3.5 bg-[#0a0a0a] border border-gray-800 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-3.5 text-gray-500 hover:text-white transition-colors">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* --- CHECKBOX CUSTOMIZADO "Permanecer Logado" --- */}
            {isLogin && (
                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer group">
                        <div 
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                rememberMe 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'bg-[#0a0a0a] border-gray-700 group-hover:border-gray-500'
                            }`}
                            onClick={() => setRememberMe(!rememberMe)}
                        >
                            {rememberMe && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        {/* Checkbox invisível para acessibilidade */}
                        <input 
                            type="checkbox" 
                            className="hidden" 
                            checked={rememberMe} 
                            onChange={(e) => setRememberMe(e.target.checked)} 
                        />
                        <span className="text-sm text-gray-400 group-hover:text-gray-300 select-none">
                            Permanecer conectado
                        </span>
                    </label>
                    
                    {/* Link de esqueci a senha (Visual) */}
                    <button type="button" className="text-sm text-blue-500 hover:text-blue-400 hover:underline">
                        Esqueceu?
                    </button>
                </div>
            )}

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-red-400 text-sm font-medium">{error}</p>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{isLogin ? 'Entrar na Plataforma' : 'Começar Agora'} <ArrowRight className="w-5 h-5" /></>}
            </button>
          </form>
        </div>
        
        <p className="text-center text-gray-600 text-xs mt-8">© 2025 Study Planner. Todos os direitos reservados.</p>
      </div>
    </div>
  );
}

export default Login;