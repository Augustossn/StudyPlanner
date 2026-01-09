import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../services/api';
import { toast } from 'react-hot-toast'; // Importação recomendada para feedback
import { 
  Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Check 
} from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para o Checkbox "Permanecer conectado"
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
      if (isLogin) {
        // --- LOGIN ---
        const response = await authAPI.login(formData.email, formData.password);
        
        if (response.data) {
            const userData = JSON.stringify(response.data);
            
            // Lógica do "Lembrar de Mim"
            if (rememberMe) {
                localStorage.setItem('user', userData); 
            } else {
                sessionStorage.setItem('user', userData); 
            }
            
            toast.success(`Bem-vindo de volta!`);
            navigate('/dashboard');
        }

      } else {
        // --- REGISTRO ---
        await authAPI.register(formData.name, formData.email, formData.password);
        toast.success('Conta criada com sucesso! Faça login.');
        setIsLogin(true); // Muda para a aba de login
        setFormData({ name: '', email: '', password: '' }); // Limpa form
      }

    } catch (err) {
      console.error("Erro:", err);
      if (err.response && err.response.data) {
        const data = err.response.data;
        if (typeof data === 'string') setError(data);
        else if (data.message) setError(data.message);
        else setError("Falha na operação.");
      } else {
        setError('Erro de conexão com o servidor.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      
      {/* Background Effects (Sutis) */}
      <div className="absolute top-[-20%] left-[-10%] w-125 h-125 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center justify-center mb-8 animate-in fade-in zoom-in duration-500">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 mb-6">
            <Zap className="w-8 h-8 text-white fill-white" strokeWidth={0} />
          </div>
          <h1 className="text-3xl font-bold text-text tracking-tight">
            Study<span className="text-blue-500">Planner</span>
          </h1>
          <p className="text-text-muted text-sm mt-2">Sua jornada de conhecimento começa aqui</p>
        </div>

        {/* Card Principal */}
        <div className="bg-surface/90 backdrop-blur-xl rounded-3xl p-8 border border-border shadow-2xl transition-colors duration-300">
          
          {/* Toggle Login/Register */}
          <div className="bg-background border border-border p-1 rounded-xl flex mb-8 relative">
            <div 
                className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-surface border border-border rounded-lg shadow-sm transition-all duration-300 ease-out ${isLogin ? 'left-1' : 'left-[calc(50%+4px)]'}`}
            ></div>
            <button 
                onClick={() => { setIsLogin(true); setError(''); }} 
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg relative z-10 transition-colors ${isLogin ? 'text-text' : 'text-text-muted hover:text-text'}`}
            >
                Login
            </button>
            <button 
                onClick={() => { setIsLogin(false); setError(''); }} 
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg relative z-10 transition-colors ${!isLogin ? 'text-text' : 'text-text-muted hover:text-text'}`}
            >
                Criar Conta
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Input Nome (Só aparece no Registro) */}
            <div className={`transition-all duration-300 overflow-hidden ${!isLogin ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0'}`}>
                <label className="block text-text-muted text-xs font-bold uppercase mb-2 ml-1">Nome Completo</label>
                <div className="relative group">
                    <User className="absolute left-4 top-3.5 w-5 h-5 text-text-muted group-focus-within:text-blue-500 transition-colors" />
                    <input 
                        type="text" 
                        name="name" 
                        value={formData.name} 
                        onChange={handleChange} 
                        placeholder="Ex: João Silva" 
                        required={!isLogin} 
                        className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-text placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                    />
                </div>
            </div>

            {/* Input Email */}
            <div>
              <label className="block text-text-muted text-xs font-bold uppercase mb-2 ml-1">Email</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-3.5 w-5 h-5 text-text-muted group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type="email" 
                    name="email" 
                    value={formData.email} 
                    onChange={handleChange} 
                    placeholder="seu@email.com" 
                    required 
                    className="w-full pl-12 pr-4 py-3.5 bg-background border border-border rounded-xl text-text placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                />
              </div>
            </div>

            {/* Input Senha */}
            <div>
              <label className="block text-text-muted text-xs font-bold uppercase mb-2 ml-1">Senha</label>
              <div className="relative group">
                <Lock className="absolute left-4 top-3.5 w-5 h-5 text-text-muted group-focus-within:text-blue-500 transition-colors" />
                <input 
                    type={showPassword ? "text" : "password"} 
                    name="password" 
                    value={formData.password} 
                    onChange={handleChange} 
                    placeholder="••••••••" 
                    required 
                    className="w-full pl-12 pr-12 py-3.5 bg-background border border-border rounded-xl text-text placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" 
                />
                <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-4 top-3.5 text-text-muted hover:text-text transition-colors"
                >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Opções Extras (Só no Login) */}
            {isLogin && (
                <div className="flex items-center justify-between mt-2">
                    {/* Checkbox Customizado */}
                    <label className="flex items-center gap-2 cursor-pointer group select-none">
                        <div 
                            className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                                rememberMe 
                                ? 'bg-blue-600 border-blue-600' 
                                : 'bg-background border-border group-hover:border-text-muted'
                            }`}
                            onClick={(e) => {
                                e.preventDefault();
                                setRememberMe(!rememberMe);
                            }}
                        >
                            {rememberMe && <Check className="w-3.5 h-3.5 text-white" />}
                        </div>
                        <span className="text-sm text-text-muted group-hover:text-text transition-colors">
                            Lembrar de mim
                        </span>
                    </label>
                    
                    {/* Link para Recuperação de Senha */}
                    <Link to="/recuperar-senha" className="text-sm text-blue-500 hover:text-blue-400 hover:underline transition-all font-medium">
                        Esqueceu a senha?
                    </Link>
                </div>
            )}

            {/* Mensagem de Erro */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                <p className="text-red-500 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Botão de Submit */}
            <button 
                type="submit" 
                disabled={loading} 
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-900/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-6"
            >
              {loading 
                ? <Loader2 className="w-5 h-5 animate-spin" /> 
                : <>{isLogin ? 'Entrar na Plataforma' : 'Começar Agora'} <ArrowRight className="w-5 h-5" /></>
              }
            </button>
          </form>
        </div>
        
        <p className="text-center text-text-muted text-xs mt-8">
            © 2026 StudyPlanner Pro. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}

export default Login;