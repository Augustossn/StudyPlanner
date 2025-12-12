import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast'; 
import Modal from '../Modal';
import { studySessionAPI, subjectAPI } from '../../services/api'; 
import { getErrorMessage } from '../../utils/errorHandler'; 

const ModalNovaSessao = ({ isOpen, onClose, userId, onSuccess }) => {
  // Estados do Formulário
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(60);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [completed, setCompleted] = useState(true); 
  
  const [subjects, setSubjects] = useState([]); 
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (isOpen && userId) {
      subjectAPI.getUserSubjects(userId)
        .then(res => setSubjects(res.data || []))
        .catch(() => {
            setSubjects([]);
            toast.error("Erro ao carregar matérias"); 
        });
    }
  }, [isOpen, userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const [year, month, day] = date.split('-').map(Number); 
      const now = new Date();
      const selectedDate = new Date(year, month - 1, day, now.getHours(), now.getMinutes()); 
      const isoDate = selectedDate.toISOString(); 

      await studySessionAPI.createSession({
        title,
        durationMinutes: Number(duration),
        date: isoDate,
        description,
        completed,
        user: { id: userId },
        subject: subjectId ? { id: Number(subjectId) } : null,
      });

      toast.success('Sessão registrada com sucesso!');

      onSuccess();
      onClose();
      
      setTitle('');
      setSubjectId('');
      setDescription('');
      setDuration(60);
      
    } catch (err) {
      console.error(err);
      
      const message = getErrorMessage(err);
      toast.error(message);
      
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Nova Sessão de Estudo" isOpen={isOpen} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Título</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Revisão de Java"
            className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">Matéria</label>
          <select
            id="subject"
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
            required
          >
            <option value="">Selecione uma matéria...</option>
            {subjects && subjects.length > 0 ? (
                subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                    {subject.name}
                </option>
                ))
            ) : (
                <option disabled>Nenhuma matéria cadastrada</option>
            )}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="duration" className="block text-sm font-medium text-gray-300 mb-1">Duração (min)</label>
            <input
              type="number"
              id="duration"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
              min="1"
            />
          </div>

          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-300 mb-1">Data</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="completed"
            checked={completed}
            onChange={(e) => setCompleted(e.target.checked)}
            className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
          />
          <label htmlFor="completed" className="ml-2 text-sm font-medium text-gray-300">Marcar como concluída</label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-blue-500/20"
        >
          {loading ? 'Salvando...' : 'Registrar Sessão'}
        </button>
      </form>
    </Modal>
  );
};

export default ModalNovaSessao;