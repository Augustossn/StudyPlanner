import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Layout from '../components/Layout';
import { subjectAPI } from '../services/api';
import { getErrorMessage } from '../utils/errorHandler';
import { BookOpen, Check, Layers, Plus, X } from 'lucide-react'; // Novos ícones importados

// Cores pré-definidas
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
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(COLORS[0].hex);
  
  // Novos estados para Submatérias
  const [subSubjects, setSubSubjects] = useState([]);
  const [currentSub, setCurrentSub] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Redireciona se não estiver logado
  if (!user.userId) {
    navigate('/');
    return null;
  }

  // Função para adicionar submatéria na lista
  const handleAddSubSubject = (e) => {
    e.preventDefault(); // Evita submit do form principal
    if (!currentSub.trim()) return;
    
    if (subSubjects.includes(currentSub.trim())) {
        toast.error('Essa submatéria já foi adicionada.');
        return;
    }

    setSubSubjects([...subSubjects, currentSub.trim()]);
    setCurrentSub('');
  };

  // Função para remover submatéria da lista
  const handleRemoveSubSubject = (subToRemove) => {
    setSubSubjects(subSubjects.filter(sub => sub !== subToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

  const payload = {
        name,
        color: selectedColor,
        subSubjects,
        user: { id: user.userId } // <--- SUSPEITO
    };
    console.log("PAYLOAD SENDO ENVIADO:", payload);
    console.log("USUÁRIO NO LOCALSTORAGE:", user);

    try {
      await subjectAPI.createSubject({
        name,
        color: selectedColor,
        subSubjects: subSubjects, // Envia a lista para o backend
        user: { id: user.userId }
      });

      toast.success('Matéria criada com sucesso!');
      navigate('/dashboard');

    } catch (err) {
      const message = getErrorMessage(err);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-2">Nova Matéria</h1>
        <p className="text-gray-400 mb-8">Crie categorias para organizar seus estudos.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* COLUNA DA ESQUERDA: FORMULÁRIO */}
          <div className="md:col-span-2 bg-[#1a1a1a] border border-gray-800 rounded-2xl p-8 shadow-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Nome */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Nome da Matéria</label>
                <div className="relative">
                  <BookOpen className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Matemática"
                    className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                    required
                    autoFocus
                  />
                </div>
              </div>

              {/* Submatérias (Opcional) */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">
                    Submatérias <span className="text-gray-600 text-xs normal-case ml-1">(Opcional)</span>
                </label>
                <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                        <Layers className="absolute left-4 top-3.5 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            value={currentSub}
                            onChange={(e) => setCurrentSub(e.target.value)}
                            placeholder="Ex: Geometria, Álgebra..."
                            className="w-full pl-12 pr-4 py-3 bg-[#0a0a0a] border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-gray-600"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    handleAddSubSubject(e);
                                }
                            }}
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleAddSubSubject}
                        className="bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-xl border border-gray-700 transition-colors"
                        title="Adicionar Submatéria"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                </div>
                
                {/* Lista de Tags Adicionadas */}
                {subSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-[#0a0a0a] rounded-xl border border-dashed border-gray-800">
                        {subSubjects.map((sub, index) => (
                            <span 
                                key={index} 
                                className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-gray-300 text-sm rounded-lg border border-gray-700"
                            >
                                {sub}
                                <button
                                    type="button"
                                    onClick={() => handleRemoveSubSubject(sub)}
                                    className="hover:text-red-400 transition-colors ml-1"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
              </div>

              {/* Seletor de Cores */}
              <div>
                <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-wider">Cor de Identificação</label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color.hex}
                      type="button"
                      onClick={() => setSelectedColor(color.hex)}
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform hover:scale-110 ${
                        selectedColor === color.hex ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]' : ''
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.label}
                    >
                      {selectedColor === color.hex && <Check className="w-5 h-5 text-white drop-shadow-md" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Botões */}
              <div className="flex gap-4 pt-4 border-t border-gray-800 mt-8">
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-3 bg-transparent border border-gray-700 text-gray-300 hover:bg-gray-800 font-semibold rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || !name}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/20"
                >
                  {loading ? 'Salvando...' : 'Criar Matéria'}
                </button>
              </div>
            </form>
          </div>

          {/* COLUNA DA DIREITA: PREVIEW (Visualização) */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-bold text-gray-500 uppercase mb-3 tracking-wider">Pré-visualização</h3>
            
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 opacity-100 transition-all">
                <div className="flex items-center gap-3 mb-3">
                    <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg transition-colors duration-300"
                        style={{ backgroundColor: selectedColor }}
                    >
                        <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div className="overflow-hidden">
                        <p className="font-bold text-white truncate">{name || 'Nome da Matéria'}</p>
                        <p className="text-xs text-gray-500">
                            {subSubjects.length > 0 
                                ? `${subSubjects.length} submatérias cadastradas`
                                : 'Nenhuma submatéria'}
                        </p>
                    </div>
                </div>
                <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden mb-4">
                    <div className="h-full w-2/3 transition-colors duration-300" style={{ backgroundColor: selectedColor }}></div>
                </div>

                {/* Preview das Tags */}
                {subSubjects.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {subSubjects.slice(0, 3).map((sub, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700">
                                {sub}
                            </span>
                        ))}
                        {subSubjects.length > 3 && (
                            <span className="text-[10px] px-2 py-0.5 text-gray-500">
                                +{subSubjects.length - 3}
                            </span>
                        )}
                    </div>
                )}
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">
              Você poderá selecionar essas submatérias ao registrar uma nova sessão.
            </p>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default NovaMateria;