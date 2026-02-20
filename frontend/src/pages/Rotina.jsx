import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { CalendarDays, Plus, Pencil, Trash2, Clock3, CircleHelp } from 'lucide-react';
import Layout from '../components/Layout';
import { getAuthUser } from '../utils/auth';

const WEEK_DAYS = [
  { key: 'MONDAY', label: 'Segunda-feira' },
  { key: 'TUESDAY', label: 'Terca-feira' },
  { key: 'WEDNESDAY', label: 'Quarta-feira' },
  { key: 'THURSDAY', label: 'Quinta-feira' },
  { key: 'FRIDAY', label: 'Sexta-feira' },
  { key: 'SATURDAY', label: 'Sabado' },
  { key: 'SUNDAY', label: 'Domingo' }
];

const getStorageKey = (userId) => `routine_plans_${userId}`;

const getEmptyForm = () => ({
  day: 'MONDAY',
  subject: '',
  hours: '',
  questions: ''
});

function Rotina() {
  const [user] = useState(() => getAuthUser());
  const [routines, setRoutines] = useState(() => {
    if (!user?.userId) return [];
    try {
      const saved = localStorage.getItem(getStorageKey(user.userId));
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(error);
      return [];
    }
  });
  const [form, setForm] = useState(getEmptyForm());
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (!user?.userId) return;
    localStorage.setItem(getStorageKey(user.userId), JSON.stringify(routines));
  }, [routines, user]);

  const groupedByDay = useMemo(() => {
    const grouped = WEEK_DAYS.map((day) => ({
      ...day,
      items: routines.filter((routine) => routine.day === day.key)
    }));
    return grouped;
  }, [routines]);

  const resetForm = () => {
    setForm(getEmptyForm());
    setEditingId(null);
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const subject = form.subject.trim();
    const hours = Number(form.hours || 0);
    const questions = Number(form.questions || 0);

    if (!subject) {
      toast.error('Informe a matéria da rotina.');
      return;
    }

    if (hours <= 0 && questions <= 0) {
      toast.error('Informe horas ou quantidade de questões.');
      return;
    }

    const payload = {
      id: editingId || Date.now(),
      day: form.day,
      subject,
      hours,
      questions
    };

    if (editingId) {
      setRoutines((prev) => prev.map((item) => (item.id === editingId ? payload : item)));
      toast.success('Rotina atualizada.');
    } else {
      setRoutines((prev) => [...prev, payload]);
      toast.success('Rotina adicionada.');
    }

    resetForm();
  };

  const handleEdit = (routine) => {
    setEditingId(routine.id);
    setForm({
      day: routine.day,
      subject: routine.subject,
      hours: routine.hours ? String(routine.hours) : '',
      questions: routine.questions ? String(routine.questions) : ''
    });
  };

  const handleDelete = (id) => {
    setRoutines((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) resetForm();
    toast.success('Rotina removida.');
  };

  return (
    <Layout>
      <div className="space-y-6 animate-in fade-in duration-500 pb-20">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text">Rotinas</h1>
            <p className="text-sm text-text-muted">
              Monte seu plano semanal de estudo por matéria, horas e questões.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-surface border border-border rounded-xl text-text-muted text-xs">
            <CalendarDays className="w-4 h-4" />
            Planejamento semanal
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5">
          <h2 className="text-sm font-bold uppercase tracking-wide text-text-muted mb-4">
            {editingId ? 'Editar rotina' : 'Nova rotina'}
          </h2>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-3">
            <select
              value={form.day}
              onChange={(event) => setForm((prev) => ({ ...prev, day: event.target.value }))}
              className="md:col-span-1 bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-text outline-none focus:border-blue-500"
            >
              {WEEK_DAYS.map((day) => (
                <option key={day.key} value={day.key}>
                  {day.label}
                </option>
              ))}
            </select>

            <input
              type="text"
              value={form.subject}
              onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
              className="md:col-span-2 bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-text outline-none focus:border-blue-500"
              placeholder="Matéria (ex.: Matemática)"
            />

            <input
              type="number"
              min="0"
              step="0.5"
              value={form.hours}
              onChange={(event) => setForm((prev) => ({ ...prev, hours: event.target.value }))}
              className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-text outline-none focus:border-blue-500"
              placeholder="Horas"
            />

            <input
              type="number"
              min="0"
              step="1"
              value={form.questions}
              onChange={(event) => setForm((prev) => ({ ...prev, questions: event.target.value }))}
              className="bg-background border border-border rounded-xl px-3 py-2.5 text-sm text-text outline-none focus:border-blue-500"
              placeholder="Questões"
            />

            <div className="md:col-span-5 flex items-center gap-2 mt-1">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors"
              >
                <Plus className="w-4 h-4" />
                {editingId ? 'Salvar alteracoes' : 'Adicionar rotina'}
              </button>

              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 rounded-xl border border-border text-sm text-text-muted hover:text-text hover:bg-surface-hover transition-colors"
                >
                  Cancelar edicao
                </button>
              )}
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {groupedByDay.map((day) => (
            <div key={day.key} className="bg-surface border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-text">{day.label}</h3>
                <span className="text-xs text-text-muted">{day.items.length} rotina(s)</span>
              </div>

              <div className="space-y-2">
                {day.items.length > 0 ? (
                  day.items.map((item) => (
                    <div key={item.id} className="bg-background border border-border rounded-xl p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-text">{item.subject}</p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-text-muted">
                            {item.hours > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface border border-border">
                                <Clock3 className="w-3 h-3" />
                                {item.hours}h
                              </span>
                            )}
                            {item.questions > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-surface border border-border">
                                <CircleHelp className="w-3 h-3" />
                                {item.questions} questoes
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface transition-colors"
                            title="Editar"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg border border-border text-red-400 hover:bg-red-500/10 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="border border-dashed border-border rounded-xl p-4 text-sm text-text-muted">
                    Nenhuma rotina para este dia.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Rotina;
