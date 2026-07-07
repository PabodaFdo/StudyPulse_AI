import { useState, useEffect } from 'react';
import { BookOpen, Plus, Target, Trash2, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const Subjects = () => {
  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSubjectId, setEditingSubjectId] = useState(null);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [subjectToDelete, setSubjectToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [newName, setNewName] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newCredits, setNewCredits] = useState('3');
  const [newTarget, setNewTarget] = useState('A');

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/subjects');
      // Normalize data to match UI needs
      const formatted = res.data.map(sub => ({
        id: sub.id,
        name: sub.name || sub.subjectName || 'Unknown Subject',
        code: sub.code || 'N/A',
        credits: sub.credits || 0,
        target: sub.gradeTarget || sub.target || 'N/A',
        current: sub.currentStanding || sub.current || '-',
        health: sub.status === 'red' ? 'red' : sub.status === 'yellow' ? 'yellow' : 'green',
        raw: sub // keep raw data for updates
      }));
      setSubjects(formatted);
    } catch (error) {
      toast.error('Failed to load subjects. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSubject = async (e) => {
    e.preventDefault();
    if (!newName) {
      toast.error('Please fill in the Subject Name');
      return;
    }
    try {
      await api.post('/subjects', {
        subjectName: newName,
        name: newName,
        code: newCode,
        credits: parseInt(newCredits),
        gradeTarget: newTarget
      });
      setNewName('');
      setNewCode('');
      setOpenAddModal(false);
      toast.success(`${newName} added successfully!`);
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add subject');
    }
  };

  const handleUpdateSubject = async (e) => {
    e.preventDefault();
    if (!newName) {
      toast.error('Please fill in the Subject Name');
      return;
    }
    try {
      await api.put(`/subjects/${editingSubjectId}`, {
        subjectName: newName,
        name: newName,
        code: newCode,
        credits: parseInt(newCredits),
        gradeTarget: newTarget
      });
      setNewName('');
      setNewCode('');
      setEditingSubjectId(null);
      setOpenEditModal(false);
      toast.success(`Subject updated successfully!`);
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update subject');
    }
  };

  const openEdit = (sub) => {
    setNewName(sub.name);
    setNewCode(sub.code === 'N/A' ? '' : sub.code);
    setNewCredits(sub.credits.toString());
    setNewTarget(sub.target === 'N/A' ? 'A' : sub.target);
    setEditingSubjectId(sub.id);
    setOpenEditModal(true);
  };

  const handleDeleteClick = (sub) => {
    setSubjectToDelete(sub);
    setOpenDeleteModal(true);
  };

  const confirmDeleteSubject = async () => {
    if (!subjectToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/subjects/${subjectToDelete.id}`);
      toast.success('Subject deleted');
      setOpenDeleteModal(false);
      setSubjectToDelete(null);
      fetchSubjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete subject');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subjects Directory"
        subtitle="Manage your courses, credits, target grades, and current standings."
        icon={BookOpen}
        action={
          <Button onClick={() => {
            setNewName('');
            setNewCode('');
            setNewCredits('3');
            setNewTarget('A');
            setOpenAddModal(true);
          }} className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Add Subject
          </Button>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((sub) => (
          <div key={sub.id} className="app-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className={`status-badge ${sub.health === 'red' ? 'status-danger' : sub.health === 'yellow' ? 'status-warning' : 'status-success'}`}>{sub.code}</span>
                  <h3 className="card-title text-xl mt-2">{sub.name}</h3>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(sub)} className="p-2 rounded-lg !text-slate-600 dark:!text-slate-300 hover:!text-purple-600 dark:hover:!text-purple-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDeleteClick(sub)} className="p-2 rounded-lg !text-slate-600 dark:!text-slate-300 hover:!text-red-600 dark:hover:!text-red-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-xs mt-4 py-3 border-y border-slate-200 dark:border-white/5">
                <div>
                  <p className="card-muted text-[10px] uppercase font-semibold">Credits</p>
                  <p className="text-sm app-readable-text mt-0.5">{sub.credits} Units</p>
                </div>
                <div>
                  <p className="card-muted text-[10px] uppercase font-semibold">Grade Target</p>
                  <p className="text-sm app-readable-text mt-0.5 flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-brand-400" /> {sub.target}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-4">
              <div>
                <span className="text-[10px] card-muted uppercase font-semibold">Current Standings</span>
                <p className="text-sm font-bold app-readable-text">{sub.current}</p>
              </div>
              <span className={`status-badge ${sub.health === 'red' ? 'status-danger' : sub.health === 'yellow' ? 'status-warning' : 'status-success'}`}>
                {sub.health === 'red' ? 'Needs Attention' : 'On Track'}
              </span>
            </div>
          </div>
        ))}
        {subjects.length === 0 && (
          <div className="col-span-full py-10 text-center text-gray-500">
            No subjects found. Add a subject to get started.
          </div>
        )}
      </div>

      {/* Add/Edit Subject Modal */}
      <Modal open={openAddModal || openEditModal} onClose={() => { setOpenAddModal(false); setOpenEditModal(false); }} title={openEditModal ? "Edit Subject" : "Add New Subject"}>
        <form onSubmit={openEditModal ? handleUpdateSubject : handleAddSubject} className="space-y-4 mt-2">
          <Input
            label="Subject Name"
            placeholder="e.g. Advanced Calculus"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <Input
            label="Subject Code"
            placeholder="e.g. MATH 302"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Credits"
              value={newCredits}
              onChange={(e) => setNewCredits(e.target.value)}
              options={[
                { value: '1', label: '1 Unit' },
                { value: '2', label: '2 Units' },
                { value: '3', label: '3 Units' },
                { value: '4', label: '4 Units' },
                { value: '5', label: '5 Units' },
              ]}
            />
            <Select
              label="Target Grade"
              value={newTarget}
              onChange={(e) => setNewTarget(e.target.value)}
              options={[
                { value: 'A+', label: 'A+' },
                { value: 'A', label: 'A' },
                { value: 'A-', label: 'A-' },
                { value: 'B+', label: 'B+' },
                { value: 'B', label: 'B' },
              ]}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={() => { setOpenAddModal(false); setOpenEditModal(false); }}>
              Cancel
            </Button>
            <Button type="submit">
              Save Subject
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={openDeleteModal} onClose={() => !isDeleting && setOpenDeleteModal(false)} title="Delete Subject?">
        <div className="space-y-4 mt-2 text-left">
          <p className="text-sm text-[#6b6388] dark:text-slate-300">
            Are you sure you want to delete <span className="font-bold text-[#241b4b] dark:text-white">{subjectToDelete?.name}</span>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
            <Button type="button" variant="secondary" onClick={() => setOpenDeleteModal(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button type="button" onClick={confirmDeleteSubject} disabled={isDeleting} className="bg-red-500 hover:bg-red-600 text-white border-transparent">
              {isDeleting ? 'Deleting...' : 'Delete Subject'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Subjects;
