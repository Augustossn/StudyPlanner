import React, { useState } from 'react';
import toast from 'react-hot-toast'; 
import Modal from '../Modal';
import { goalsAPI } from '../../services/api';
import { getErrorMessage } from '../../utils/errorHandler'; 

const ModalNovaMeta = ({ isOpen, onClose, userId, onSuccess }) => {
  const [title, setTitle] = useState('');
  const [goalType, setGoalType] = useState('Semanal');
  const [targetHours, setTargetHours] = useState(10);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await goalsAPI.createGoal({
        title,
        goalType,
        targetHours,
        startDate, 
        active: true,
        user: { id: userId }
      });
      
      toast.success('Meta criada com sucesso!');

      if (onSuccess) onSuccess();

      onClose();
      
      setTitle('');
      setTargetHours(10);
      setGoalType('Semanal'); 
      
    } catch (err) {
      console.error(err);
      
      // ERRO
      const message = getErrorMessage(err);
      toast.error(message);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Nova Meta de Estudo" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">Título da Meta</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Concluir módulo de React"
            className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="goalType" className="block text-sm font-medium text-gray-300 mb-2">Tipo de Meta</label>
            <select
              id="goalType"
              value={goalType}
              onChange={(e) => setGoalType(e.target.value)}
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500 appearance-none"
            >
              <option>Semanal</option>
              <option>Mensal</option>
              <option>Total</option>
            </select>
          </div>
          <div>
            <label htmlFor="targetHours" className="block text-sm font-medium text-gray-300 mb-2">Horas Alvo</label>
            <input
              type="number"
              id="targetHours"
              value={targetHours}
              onChange={(e) => setTargetHours(Number(e.target.value))}
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
              required
              min="1"
            />
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-2">Data Início</label>
            <input
              type="date"
              id="startDate"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 disabled:opacity-50"
          disabled={loading || !title}
        >
          {loading ? 'Criando...' : 'Criar Meta'}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNovaMeta;