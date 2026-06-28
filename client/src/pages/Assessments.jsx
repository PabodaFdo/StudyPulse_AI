import { useState, useEffect } from 'react';
import { ClipboardList, Plus, Edit2, Trash2, AlertTriangle, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { subjectService } from '../services/subject.service';
import { assessmentService } from '../services/assessment.service';
import PageHeader from '../components/PageHeader';

const assessmentTypes = [
  'Quiz',
  'Assignment',
  'Mid Exam',
  'Final Exam',
  'Practical',
  'Presentation',
  'Other'
];

const defaultFormState = {
  title: '',
  type: 'Quiz',
  mark: '',
  weight: '',
  assessmentDate: '',
  notes: ''
};

const defaultSummary = {
  totalAssessments: 0,
  totalWeight: 0,
  weightedAverage: null,
  remainingWeight: 100,
  breakdown: {},
  assessments: []
};

const Assessments = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
  const [assessments, setAssessments] = useState([]);
  const [summary, setSummary] = useState(defaultSummary);
  const [loading, setLoading] = useState(false);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(defaultFormState);

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      setSummary(defaultSummary); // Reset before fetching
      fetchAssessmentData(selectedSubjectId);
    } else {
      setAssessments([]);
      setSummary(defaultSummary);
    }
  }, [selectedSubjectId]);

  const fetchSubjects = async () => {
    try {
      const data = await subjectService.getSubjects();
      setSubjects(data);
    } catch (err) {
      toast.error('Failed to load subjects.');
    }
  };

  const fetchAssessmentData = async (subjectId) => {
    setLoading(true);
    try {
      const [listRes, summaryRes] = await Promise.all([
        assessmentService.getAssessmentsBySubject(subjectId),
        assessmentService.getAssessmentSummary(subjectId)
      ]);
      setAssessments(listRes || []);
      setSummary(summaryRes?.data || summaryRes || defaultSummary);
    } catch (err) {
      toast.error('Failed to load assessments.');
      setSummary(defaultSummary);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      title: item.title,
      type: item.type,
      mark: item.mark,
      weight: item.weight,
      assessmentDate: item.assessmentDate ? new Date(item.assessmentDate).toISOString().split('T')[0] : '',
      notes: item.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this assessment?')) return;
    try {
      await assessmentService.deleteAssessment(id);
      toast.success('Assessment deleted');
      fetchAssessmentData(selectedSubjectId);
    } catch (err) {
      toast.error('Failed to delete assessment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId) return toast.error('Please select a subject first.');
    
    if (formData.mark < 0 || formData.mark > 100) return toast.error('Mark must be between 0 and 100.');
    if (formData.weight <= 0 || formData.weight > 100) return toast.error('Weight must be between 1 and 100.');

    try {
      const payload = {
        subjectId: selectedSubjectId,
        title: formData.title,
        type: formData.type,
        mark: Number(formData.mark),
        weight: Number(formData.weight),
        assessmentDate: formData.assessmentDate || null,
        notes: formData.notes
      };

      if (editingId) {
        await assessmentService.updateAssessment(editingId, payload);
        toast.success('Assessment updated successfully');
      } else {
        await assessmentService.createAssessment(payload);
        toast.success('Assessment added successfully');
      }
      
      setShowForm(false);
      setEditingId(null);
      setFormData({
        title: '',
        type: 'Quiz',
        mark: '',
        weight: '',
        assessmentDate: '',
        notes: ''
      });
      fetchAssessmentData(selectedSubjectId);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save assessment');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      <PageHeader
        title="Assessments / Marks"
        subtitle="Track your grades, calculate weighted averages, and monitor your academic performance."
        icon={ClipboardList}
      />

      <div className="bg-white/80 dark:bg-slate-900/70 border border-purple-100 dark:border-slate-700 p-6 rounded-2xl">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2">Select Subject</label>
        <div className="flex gap-4 items-center">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="flex-1 max-w-md px-4 py-2.5 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple"
          >
            <option value="">Select a subject...</option>
            {subjects.map(sub => (
              <option key={sub.id} value={sub.id}>{sub.name}</option>
            ))}
          </select>
          {selectedSubjectId && (
            <button
              onClick={() => {
                if (summary?.remainingWeight === 0) {
                  return toast.error('This subject already has 100% total weight. Edit existing assessments before adding more.');
                }
                setEditingId(null);
                
                let defaultWeight = '';
                if (summary?.remainingWeight >= 10) {
                  defaultWeight = '10';
                } else if (summary?.remainingWeight > 0) {
                  defaultWeight = summary.remainingWeight.toString();
                }

                setFormData({
                  title: '',
                  type: 'Quiz',
                  mark: '',
                  weight: defaultWeight,
                  assessmentDate: '',
                  notes: ''
                });
                setShowForm(true);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-colors ${summary?.remainingWeight === 0 ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-purple hover:bg-purple-dark text-white'}`}
            >
              <Plus className="w-4 h-4" /> Add Assessment
            </button>
          )}
        </div>
      </div>

      {loading && <div className="text-center py-10 text-slate-500">Loading data...</div>}

      {!loading && !selectedSubjectId && (
        <div className="bg-white/80 dark:bg-slate-900/70 border border-purple-100 dark:border-slate-700 p-10 rounded-2xl text-center">
          <p className="text-slate-500 dark:text-slate-400">Select a subject to view assessment analytics.</p>
        </div>
      )}

      {!loading && selectedSubjectId && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white/80 dark:bg-slate-900/70 border border-purple-100 dark:border-slate-700 p-5 rounded-2xl">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-semibold">Total Assessments</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary?.totalAssessments || 0}</p>
            </div>
            
            <div className="bg-white/80 dark:bg-slate-900/70 border border-purple-100 dark:border-slate-700 p-5 rounded-2xl">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-semibold">Total Weight</p>
              <div className="flex items-center gap-2">
                <p className={`text-2xl font-bold ${summary?.totalWeight > 100 ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                  {summary?.totalWeight || 0}%
                </p>
                {summary?.totalWeight > 100 && <AlertTriangle className="w-5 h-5 text-red-500" />}
              </div>
            </div>

            <div className="bg-white/80 dark:bg-slate-900/70 border border-purple-100 dark:border-slate-700 p-5 rounded-2xl">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-1 font-semibold">Remaining Weight</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{summary?.remainingWeight || 0}%</p>
            </div>

            <div className="bg-purple/10 dark:bg-cyan-900/20 border border-purple/30 dark:border-cyan-800 p-5 rounded-2xl">
              <p className="text-sm text-purple-700 dark:text-cyan-300 mb-1 font-semibold">Weighted Average</p>
              <p className={`text-3xl font-extrabold ${summary?.weightedAverage !== null ? 'text-purple-900 dark:text-cyan-100' : 'text-slate-500 dark:text-slate-400 text-lg'}`}>
                {summary?.weightedAverage !== null ? `${summary?.weightedAverage}%` : 'No data'}
              </p>
            </div>
          </div>

          {/* Warnings / Infos */}
          {summary?.assessments?.length === 0 && (
            <div className="flex items-center gap-3 p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-400 font-medium text-sm">
              <Info className="w-5 h-5" />
              No assessments added yet. Add your first assessment to calculate weighted average.
            </div>
          )}
          {summary?.totalWeight > 100 && (
            <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 font-medium text-sm">
              <AlertTriangle className="w-5 h-5" />
              Total assessment weight is above 100%. Please check your weights.
            </div>
          )}
          {summary?.totalWeight > 0 && summary?.totalWeight < 100 && (
            <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-600 dark:text-blue-400 font-medium text-sm">
              <Info className="w-5 h-5" />
              You still have remaining assessment weight to add.
            </div>
          )}

          {/* Form Modal/Overlay */}
          {showForm && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
              <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg p-6 md:p-8 shadow-2xl border border-slate-200 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {editingId ? 'Edit Assessment' : 'Add Assessment'}
                  </h3>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    Remaining: {summary?.remainingWeight || 0}%
                  </span>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Title</label>
                    <input required name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Quiz 1" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                      <select name="type" value={formData.type} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                        {assessmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Date (Optional)</label>
                      <input type="date" name="assessmentDate" value={formData.assessmentDate} onChange={handleInputChange} className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Mark (%)</label>
                      <input required type="number" step="0.1" name="mark" value={formData.mark} onChange={handleInputChange} placeholder="0-100" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Weight (%)</label>
                      <input required type="number" step="0.01" name="weight" value={formData.weight} onChange={handleInputChange} disabled={!editingId && summary?.remainingWeight === 0} placeholder="e.g. 20" className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white disabled:opacity-50" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                    <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3} placeholder="Any notes or feedback..." className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white"></textarea>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors">Cancel</button>
                    <button type="submit" className="px-5 py-2.5 rounded-xl bg-purple hover:bg-purple-dark text-white font-bold transition-colors">
                      {editingId ? 'Save Changes' : 'Add Assessment'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="bg-white/80 dark:bg-slate-900/70 border border-purple-100 dark:border-slate-700 rounded-2xl overflow-hidden mt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Title</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Type</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Mark</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Weight</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-700 dark:text-slate-300 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {assessments.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                        No assessments recorded for this subject yet.
                      </td>
                    </tr>
                  ) : (
                    assessments.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900 dark:text-white">{item.title}</p>
                          {item.notes && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-[200px]">{item.notes}</p>}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium">{item.type}</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{item.mark}%</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{item.weight}%</td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                          {item.assessmentDate ? new Date(item.assessmentDate).toLocaleDateString() : '--'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-purple dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Assessments;
