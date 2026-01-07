import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { subjectAPI } from '../services/api';
// import { getErrorMessage } from '../utils/errorHandler'; // Tratamento local
import { BookOpen, Check, Layers, Plus, X, Save, ArrowLeft, Palette } from 'lucide-react';
import { getAuthUser } from '../utils/auth';

const COLORS = [
  { name: 'Blue', hex: '#3b82f6', label: 'Azul' },
  { name: 'Red', hex: '#ef4444', label: 'Vermelho' },
  { name: 'Green', hex: '#22c55e', label: 'Verde' },
  { name: 'Purple', hex: '#a855f7', label: 'Roxo' },
  { name: 'Orange', hex: '#f97316', label: 'Laranja' },
  { name: 'Pink', hex: '#ec4899', label: 'Rosa' },
  { name: 'Cyan', hex: '#06b6d4', label: 'Ciano' },
  { name: 'Yellow', hex: '#eab308', label: 'Amarelo' },
];

const NovaMateria = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user] = useState(() => getAuthUser());

  // Verifica se veio dados para edição
  const editingSubject = location.state?.subjectToEdit;
  const isEditing = !!editingSubject;

  // Inicializa estados
  const [name, setName] = useState(editingSubject?.name || '');
  const [selectedColor, setSelectedColor] = useState(editingSubject?.color || COLORS[0].hex);
  
  // Lista de Assuntos (Backend espera List<String>)
  const [matters, setMatters] = useState(editingSubject?.matters || []);
  
  // Input temporário para adicionar assuntos
  const [currentMatter, setCurrentMatter] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user.userId) {
        navigate('/');
    }
  }, [user.userId, navigate]);

  const handleAddMatters = (e) => {
    e.preventDefault();
    if (!currentMatter.trim()) return;

    if (matters.includes(currentMatter.trim())) {
        toast.error('Esse assunto já foi adicionado.');
        return;
    }

    setMatters([...matters, currentMatter.trim()]);
    setCurrentMatter('');
  };

  const handleRemoveMatter = (matterToRemove) => {
    setMatters(matters.filter(matter => matter !== matterToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        name,
        color: selectedColor,
        matters, // Envia array de strings direto
        user: { id: user.userId }
      };

      if (isEditing) {
        await subjectAPI.updateSubject(editingSubject.id, payload);
        toast.success('Matéria atualizada com sucesso!');
      } else {
        await subjectAPI.createSubject(payload);
        toast.success('Matéria criada com sucesso!');
      }

      navigate('/dashboard');

    } catch (err) {
      console.error("Erro ao salvar matéria:", err);

      // --- TRATAMENTO DE ERRO (Global Exception Handler) ---
      if (err.response && err.response.status === 400 && err.response.data) {
          const data = err.response.data;
          
          if (typeof data === 'object' && !Array.isArray(data)) {
              // Pega a primeira mensagem de erro (ex: "name": "O nome é obrigatório")
              const firstErrorKey = Object.keys(data)[0];
              toast.error(data[firstErrorKey]);
          } else {
              toast.error(data.message || "Verifique os dados informados.");
          }
      } else {
          toast.error("Erro ao salvar matéria.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors"
        >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Dashboard
        </button>

        <h1 className="text-3xl font-bold text-white mb-2">
            {isEditing ? 'Editar Matéria' : 'Criar Nova Matéria'}
        </h1>
        <p className="text-gray-400 mb-8">
            {isEditing ? 'Atualize as informações e tópicos de estudo.' : 'Organize seus estudos criando categorias (disciplinas).'}
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* COLUNA DA ESQUERDA: FORMULÁRIO */}
          <div className="lg:col-span-2 bg-[#121212] border border-gray-800 rounded-2xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Nome */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Nome da Matéria</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Matemática, Java, Inglês..."
                    className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                    required
                    autoFocus={!isEditing}
                  />
                </div>
              </div>

              {/* Seletor de Cores */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider items-center gap-2">
                    <Palette className="w-4 h-4"/> Cor de Identificação
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 bg-[#0a0a0a] p-4 rounded-xl border border-gray-800">
                  {COLORS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setSelectedColor(color.hex)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${
                        selectedColor === color.hex 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0a0a0a] scale-110' 
                        : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    >
                      {selectedColor === color.hex && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assuntos (Tag Input) */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                    Tópicos / Assuntos <span className="text-gray-600 text-xs normal-case ml-1 font-normal">(Opcional)</span>
                </label>
                <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                        <Layers className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={currentMatter}
                            onChange={(e) => setCurrentMatter(e.target.value)}
                            placeholder="Ex: Geometria, Verbos, Spring Boot..."
                            className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddMatters(e);
                                }
                            }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleAddMatters}
                        disabled={!currentMatter.trim()}
                        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-xl border border-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Adicionar"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Lista de Tags */}
                {matters.length > 0 ? (
                    <div className="flex flex-wrap gap-2 p-4 bg-[#0a0a0a] rounded-xl border border-dashed border-gray-800 min-h-15">
                        {matters.map((matter, index) => (
                            <span 
                                key={index} 
                                className="flex items-center gap-1 pl-3 pr-2 py-1.5 bg-gray-800 text-gray-300 text-sm rounded-lg border border-gray-700 animate-in fade-in zoom-in duration-200 group hover:border-gray-600"
                            >
                                {matter}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveMatter(matter)}
                                    className="hover:text-red-400 transition-colors ml-1 p-0.5 rounded-md hover:bg-gray-700"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <p className="text-xs text-gray-600 ml-1">
                        Adicione subtópicos para detalhar suas sessões de estudo (ex: em 'Inglês', adicione 'Gramática', 'Vocabulário').
                    </p>
                )}
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4 border-t border-gray-800 mt-8">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 font-semibold rounded-xl transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !name}
                  className="flex-1 py-3 bg-linear-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isEditing ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  {loading ? 'Salvando...' : (isEditing ? 'Salvar Alterações' : 'Criar Matéria')}
                </button>
              </div>
            </form>
          </div>

          {/* COLUNA DA DIREITA: PREVIEW */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
                <h3 className="text-sm font-bold text-gray-500 uppercase mb-4 tracking-wider flex items-center gap-2">
                    <BookOpen className="w-4 h-4"/> Pré-visualização do Card
                </h3>
                
                <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl p-6 shadow-xl transition-all duration-300 relative overflow-hidden group">
                    {/* Efeito de brilho no fundo baseado na cor */}
                    <div 
                        className="absolute top-0 right-0 w-32 h-32 opacity-10 blur-[60px] rounded-full transition-colors duration-300 pointer-events-none"
                        style={{ backgroundColor: selectedColor }}
                    />

                    <div className="flex items-start gap-4 mb-4 relative z-10">
                        <div 
                            className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-colors duration-300 shrink-0"
                            style={{ backgroundColor: selectedColor }}
                        >
                            <BookOpen className="w-6 h-6 text-white" />
                        </div>
                        <div className="overflow-hidden">
                            <h4 className="font-bold text-white text-lg truncate leading-tight">
                                {name || 'Nome da Matéria'}
                            </h4>
                            <p className="text-sm text-gray-500 mt-1">
                                {matters.length > 0 
                                    ? `${matters.length} tópicos cadastrados`
                                    : 'Nenhum tópico cadastrado'}
                            </p>
                        </div>
                    </div>
                    
                    {/* Barra de Progresso Fictícia */}
                    <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs text-gray-400">
                            <span>Progresso (Exemplo)</span>
                            <span>0%</span>
                        </div>
                        <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div className="h-full w-0 transition-all duration-300" style={{ backgroundColor: selectedColor }}></div>
                        </div>
                    </div>

                    {/* Preview das Tags (Limitado a 3) */}
                    {matters.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-4 border-t border-gray-800/50">
                            {matters.slice(0, 3).map((matter, i) => (
                                <span key={i} className="text-[10px] px-2 py-1 bg-gray-800/50 text-gray-400 rounded-md border border-gray-700/50">
                                    {matter}
                                </span>
                            ))}
                            {matters.length > 3 && (
                                <span className="text-[10px] px-2 py-1 text-gray-500">
                                    +{matters.length - 3}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                <div className="mt-6 bg-blue-900/10 border border-blue-500/20 p-4 rounded-xl">
                    <p className="text-xs text-blue-200 text-center leading-relaxed">
                      {isEditing 
                        ? 'Ao salvar, todas as metas e sessões vinculadas a esta matéria serão atualizadas visualmente.' 
                        : 'Você poderá usar esta matéria para categorizar suas metas e sessões de estudo.'}
                    </p>
                </div>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default NovaMateria;