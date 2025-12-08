import React, { useState } from 'react';
import Modal from '../Modal';
import { subjectAPI } from '../../services/api'; // Importando a API correta

const colorOptions = [
  '#3B82F6', // blue-500
  '#10B981', // emerald-500
  '#F59E0B', // amber-500
  '#EF4444', // red-500
  '#8B5CF6', // violet-500
  '#EC4899', // pink-500
  '#A8A29E', // stone-500
  '#06B6D4', // cyan-500
];

// Recebendo userId e onSuccess do Dashboard
const ModalNovaMateria = ({ isOpen, onClose, userId, onSuccess }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(colorOptions[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await subjectAPI.createSubject({
        name,
        color,
        user: { id: userId } // Usa o ID real do usuário logado
      });
      
      // Chama a função para atualizar o Dashboard
      if (onSuccess) onSuccess();
      
      onClose();
      setName('');
      setColor(colorOptions[0]);
    } catch (err) {
      setError('Erro ao criar matéria. Tente novamente.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Nova Matéria" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Nome da Matéria</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: React Avançado"
            className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Cor</label>
          <div className="flex flex-wrap gap-3">
            {colorOptions.map((c) => (
              <div
                key={c}
                className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 ${color === c ? 'ring-4 ring-offset-2 ring-offset-[#1e1e1e] ring-white' : ''}`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
              ></div>
            ))}
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50"
          disabled={loading || !name}
        >
          {loading ? 'Criando...' : 'Criar Matéria'}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNovaMateria;