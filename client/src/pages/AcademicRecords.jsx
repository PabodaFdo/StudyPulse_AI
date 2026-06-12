import { useState, useEffect } from 'react';
import { GraduationCap, Calculator, Plus, Pencil, Trash2, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import api from '../services/api';

const AcademicRecords = () => {
  const [records, setRecords] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openRecordModal, setOpenRecordModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [editingRecord, setEditingRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    subjectId: '',
    courseCode: '',
    courseName: '',
    credits: '',
    grade: 'A',
  });

  const [futureCourses, setFutureCourses] = useState([
    { id: Date.now(), credits: '3', expectedGrade: 'A' },
  ]);

  const [gpaResult, setGpaResult] = useState('0.00');

  const gradeOptions = [
    { value: 'A+', label: 'A+' },
    { value: 'A', label: 'A' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B', label: 'B' },
    { value: 'B-', label: 'B-' },
    { value: 'C+', label: 'C+' },
    { value: 'C', label: 'C' },
    { value: 'C-', label: 'C-' },
    { value: 'D+', label: 'D+' },
    { value: 'D', label: 'D' },
    { value: 'F', label: 'F' },
  ];

  const gradeValues = {
    'A+': 4.0,
    A: 4.0,
    'A-': 3.7,
    'B+': 3.3,
    B: 3.0,
    'B-': 2.7,
    'C+': 2.3,
    C: 2.0,
    'C-': 1.7,
    'D+': 1.3,
    D: 1.0,
    F: 0.0,
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const [recordsRes, subjectsRes] = await Promise.all([
        api.get('/academic-records'),
        api.get('/subjects'),
      ]);

      setRecords(recordsRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      toast.error('Failed to load academic data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingRecord(null);

    setForm({
      subjectId: subjects.length > 0 ? subjects[0].id.toString() : '',
      courseCode: '',
      courseName: '',
      credits: '',
      grade: 'A',
    });

    setOpenRecordModal(true);
  };

  const handleOpenEditModal = (record) => {
    setEditingRecord(record);

    setForm({
      subjectId: record.subjectId?.toString() || '',
      courseCode: record.courseCode || '',
      courseName: record.courseName || '',
      credits: record.credits?.toString() || '',
      grade: record.grade || record.letterGrade || 'A',
    });

    setOpenRecordModal(true);
  };

  const handleSaveRecord = async (e) => {
    e.preventDefault();

    if (!form.subjectId) {
      toast.error('Subject / Module is required.');
      return;
    }

    if (!form.courseName || form.courseName.trim() === '') {
      toast.error('Course Title is required.');
      return;
    }

    const creditsNum = Number(form.credits);

    if (!form.credits || Number.isNaN(creditsNum) || creditsNum < 1 || creditsNum > 20) {
      toast.error('Credits must be a number between 1 and 20.');
      return;
    }

    if (!form.grade) {
      toast.error('Final Letter Grade is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        subjectId: parseInt(form.subjectId, 10),
        courseCode: form.courseCode,
        courseName: form.courseName,
        credits: creditsNum,
        grade: form.grade,
        letterGrade: form.grade,
      };

      if (editingRecord) {
        const res = await api.put(`/academic-records/${editingRecord.id}`, payload);
        setRecords(records.map((r) => (r.id === editingRecord.id ? res.data : r)));
        toast.success('Academic record updated successfully!');
      } else {
        const res = await api.post('/academic-records', payload);
        setRecords([...records, res.data]);
        toast.success('Academic record created successfully!');
      }

      setOpenRecordModal(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save academic record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;

    setIsSubmitting(true);

    try {
      await api.delete(`/academic-records/${recordToDelete.id}`);
      setRecords(records.filter((r) => r.id !== recordToDelete.id));
      toast.success('Academic record deleted.');
      setOpenDeleteModal(false);
    } catch (error) {
      toast.error('Failed to delete academic record.');
    } finally {
      setIsSubmitting(false);
      setRecordToDelete(null);
    }
  };

  const calculateGpa = () => {
    let totalQualityPoints = 0;
    let totalCredits = 0;

    records.forEach((record) => {
      const displayGrade = record.grade || record.letterGrade;
      const recordCredits = Number(record.credits) || 0;

      if (recordCredits > 0 && displayGrade) {
        const gradeValue = gradeValues[displayGrade] || 0;
        totalQualityPoints += gradeValue * recordCredits;
        totalCredits += recordCredits;
      }
    });

    futureCourses.forEach((futureCourse) => {
      const futureCredits = Number(futureCourse.credits) || 0;

      if (futureCredits > 0 && futureCourse.expectedGrade) {
        const gradeValue = gradeValues[futureCourse.expectedGrade] || 0;
        totalQualityPoints += gradeValue * futureCredits;
        totalCredits += futureCredits;
      }
    });

    if (totalCredits === 0) {
      setGpaResult('0.00');
      toast.error('Add valid credits to calculate GPA.');
      return;
    }

    const projectedGpa = (totalQualityPoints / totalCredits).toFixed(2);
    setGpaResult(projectedGpa);
    toast.success(`Projected GPA Calculated: ${projectedGpa}`);
  };

  const removeFutureCourse = (courseId) => {
    setFutureCourses(futureCourses.filter((course) => course.id !== courseId));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic Records"
        subtitle="Track completed terms, letter grades, and project target GPAs."
        icon={GraduationCap}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Table of Records */}
        <div className="lg:col-span-2 glass-card p-5 border border-white/5 bg-white/[0.02] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">Current Term Courses</h3>

            <Button onClick={handleOpenCreateModal} className="gap-2 px-3 py-1.5 text-xs font-semibold">
              <Plus className="h-4 w-4" />
              Add Record
            </Button>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="py-12 flex justify-center items-center text-brand-400">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                No academic records found. Add one to get started!
              </div>
            ) : (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-lavender/30 dark:border-white/5 text-[#6b6388] dark:text-slate-300 font-semibold">
                    <th className="pb-3 px-2">Course Code</th>
                    <th className="pb-3 px-2">Course Title</th>
                    <th className="pb-3 px-2">Credits</th>
                    <th className="pb-3 px-2">Final Letter Grade</th>
                    <th className="pb-3 px-2 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-lavender/30 dark:divide-white/5 text-[#241b4b] dark:text-white">
                  {records.map((record) => (
                    <tr key={record.id} className="hover:bg-white/5 transition">
                      <td className="py-3.5 px-2 font-bold font-mono text-brand-600 dark:text-brand-300">
                        {record.courseCode || '-'}
                      </td>

                      <td className="py-3.5 px-2 font-medium">
                        {record.courseName || record.subject?.name || record.subject?.subjectName || '-'}
                      </td>

                      <td className="py-3.5 px-2">
                        {Number(record.credits) > 0 ? record.credits : '-'}
                      </td>

                      <td className="py-3.5 px-2">
                        {(() => {
                          const displayGrade = record.grade || record.letterGrade || '-';
                          const isA = displayGrade.startsWith('A');
                          const isB = displayGrade.startsWith('B');
                          const isF = displayGrade.startsWith('F');
                          const isCD = displayGrade.startsWith('C') || displayGrade.startsWith('D');

                          let pillClass = 'inline-block text-xs font-bold px-3 py-1 rounded-full border ';

                          if (isA) {
                            pillClass += 'bg-emerald-100 text-emerald-700 border-emerald-300/40 dark:bg-emerald-500/20 dark:text-emerald-300';
                          } else if (isB) {
                            pillClass += 'bg-blue-100 text-blue-700 border-blue-300/40 dark:bg-blue-500/20 dark:text-blue-300';
                          } else if (isF) {
                            pillClass += 'bg-red-100 text-red-700 border-red-300/40 dark:bg-red-500/20 dark:text-red-300';
                          } else if (isCD) {
                            pillClass += 'bg-purple-100 text-purple-700 border-purple-300/40 dark:bg-purple-500/20 dark:text-purple-300';
                          } else {
                            pillClass += 'bg-gray-100 text-gray-700 border-gray-300/40 dark:bg-gray-500/20 dark:text-gray-300';
                          }

                          return <span className={pillClass}>{displayGrade}</span>;
                        })()}
                      </td>

                      <td className="py-3.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(record)}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-brand-300"
                            title="Edit Record"
                            aria-label="Edit record"
                          >
                            <Pencil
                              size={17}
                              strokeWidth={2.5}
                              className="!text-slate-300 !stroke-slate-300"
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setRecordToDelete(record);
                              setOpenDeleteModal(true);
                            }}
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-rose-400/30 bg-rose-500/10 text-rose-400 transition hover:bg-rose-500/20 hover:text-rose-300"
                            title="Delete Record"
                            aria-label="Delete record"
                          >
                            <Trash2
                              size={17}
                              strokeWidth={2.6}
                              className="!text-rose-400 !stroke-rose-400"
                            />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* GPA Calculator / Future Course Planner */}
        <div className="glass-card p-5 border border-white/5 bg-white/[0.02] space-y-5">
          <div className="flex justify-between items-start lg:items-center flex-col lg:flex-row gap-3 lg:gap-0">
            <h3 className="font-bold text-[#241b4b] dark:text-white text-base flex items-center gap-2">
              <Calculator className="h-[18px] w-[18px] text-brand-500 dark:text-brand-400" />
              Future Course Planner
            </h3>

            <Button
              onClick={() =>
                setFutureCourses([
                  ...futureCourses,
                  { id: Date.now(), credits: '3', expectedGrade: 'A' },
                ])
              }
              className="px-2 py-1.5 text-[10px] uppercase font-bold gap-1 bg-brand-500/10 text-brand-600 hover:bg-brand-500/20 dark:text-brand-300 dark:hover:bg-brand-500/30 border-transparent shadow-none"
            >
              <Plus className="h-3 w-3" />
              Add Course
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed bg-brand-500/5 p-3 rounded-lg border border-brand-500/10">
            Use this to estimate your GPA by adding expected grades for future courses. These guesses are not saved to your records.
          </p>

          <div className="space-y-4 pt-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
            {futureCourses.map((fc, index) => (
              <div
                key={fc.id}
                className="grid grid-cols-[1fr_1fr_40px] gap-2 items-end bg-black/5 dark:bg-white/5 p-3 rounded-xl border border-white/10 dark:border-white/5"
              >
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#6b6388] dark:text-slate-400 uppercase tracking-wider">
                    Future Course Credits
                  </label>

                  <select
                    value={fc.credits}
                    onChange={(e) => {
                      const newArr = [...futureCourses];
                      newArr[index].credits = e.target.value;
                      setFutureCourses(newArr);
                    }}
                    className="w-full rounded-xl border border-lavender/40 bg-white/90 px-3 py-2.5 text-sm text-[#241b4b] outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? 'Credit' : 'Credits'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#6b6388] dark:text-slate-400 uppercase tracking-wider">
                    Expected Letter Grade
                  </label>

                  <select
                    value={fc.expectedGrade}
                    onChange={(e) => {
                      const newArr = [...futureCourses];
                      newArr[index].expectedGrade = e.target.value;
                      setFutureCourses(newArr);
                    }}
                    className="w-full rounded-xl border border-lavender/40 bg-white/90 px-3 py-2.5 text-sm text-[#241b4b] outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    {gradeOptions.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={() => removeFutureCourse(fc.id)}
                  title="Remove Course"
                  aria-label="Remove future course"
                  className="mb-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-rose-400/40 bg-rose-500/20 text-rose-300 transition hover:bg-rose-500/30 hover:text-white"
                >
                  <Trash2
                    size={16}
                    strokeWidth={2.6}
                    className="!text-rose-300 !stroke-rose-300"
                  />
                </button>
              </div>
            ))}

            {futureCourses.length === 0 && (
              <div className="text-center py-4 text-xs text-gray-500 dark:text-gray-400">
                No future courses added. GPA will be calculated based only on existing records.
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button onClick={calculateGpa} className="w-full justify-center font-semibold py-3 shadow-brand-500/20">
              Calculate Projected GPA
            </Button>
          </div>

          <div className="p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 text-center">
            <span className="text-[10px] text-gray-500 uppercase tracking-wider block font-semibold">
              PROJECTED CUMULATIVE GPA
            </span>

            <span className="text-4xl font-extrabold text-[#241b4b] dark:text-white block mt-2">
              {gpaResult}
            </span>
          </div>
        </div>
      </div>

      {/* Create / Edit Record Modal */}
      {openRecordModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-3xl border border-lavender/30 bg-[#f1e7ff] p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 dark:text-white">
            <button
              type="button"
              onClick={() => setOpenRecordModal(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-[#241b4b] transition hover:bg-white/60 dark:text-white dark:hover:bg-white/10"
              aria-label="Close record modal"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-2xl font-bold text-[#241b4b] dark:text-white">
              {editingRecord ? 'Edit Record' : 'Add Record'}
            </h2>

            <form onSubmit={handleSaveRecord} className="space-y-5 text-left">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#6b6388] dark:text-slate-200">
                  Subject / Module
                </label>

                <select
                  value={form.subjectId}
                  onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-lavender/40 bg-white/90 px-5 py-4 text-[#241b4b] outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                >
                  <option value="" disabled>
                    Select a Subject
                  </option>

                  {subjects.map((s) => (
                    <option key={s.id} value={s.id.toString()}>
                      {s.name || s.subjectName || 'Untitled Subject'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#6b6388] dark:text-slate-200">
                  Course Code
                </label>

                <input
                  type="text"
                  placeholder="e.g. CS 101"
                  value={form.courseCode}
                  onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                  className="w-full rounded-2xl border border-lavender/40 bg-white/90 px-5 py-4 text-[#241b4b] outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#6b6388] dark:text-slate-200">
                  Course Title
                </label>

                <input
                  type="text"
                  placeholder="e.g. Intro to Computer Science"
                  value={form.courseName}
                  onChange={(e) => setForm({ ...form, courseName: e.target.value })}
                  required
                  className="w-full rounded-2xl border border-lavender/40 bg-white/90 px-5 py-4 text-[#241b4b] outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#6b6388] dark:text-slate-200">
                    Credits
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    value={form.credits}
                    onChange={(e) => setForm({ ...form, credits: e.target.value })}
                    className="w-full rounded-2xl border border-lavender/40 bg-white/90 px-5 py-4 text-[#241b4b] outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-[#6b6388] dark:text-slate-200">
                    Final Letter Grade
                  </label>

                  <select
                    value={form.grade}
                    onChange={(e) => setForm({ ...form, grade: e.target.value })}
                    required
                    className="w-full rounded-2xl border border-lavender/40 bg-white/90 px-5 py-4 text-[#241b4b] outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  >
                    {gradeOptions.map((g) => (
                      <option key={g.value} value={g.value}>
                        {g.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpenRecordModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {editingRecord ? 'Save Changes' : 'Add Record'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      {openDeleteModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-3xl border border-lavender/30 bg-[#f1e7ff] p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 dark:text-white">
            <button
              type="button"
              onClick={() => setOpenDeleteModal(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-[#241b4b] transition hover:bg-white/60 dark:text-white dark:hover:bg-white/10"
              aria-label="Close delete modal"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-4 text-2xl font-bold text-[#241b4b] dark:text-white">
              Delete Record?
            </h2>

            <div className="space-y-5 text-left">
              <p className="text-sm text-[#6b6388] dark:text-slate-300 leading-relaxed">
                Are you sure you want to delete the academic record for{' '}
                <span className="font-bold text-[#241b4b] dark:text-white">
                  {recordToDelete?.courseCode || recordToDelete?.courseName || 'this subject'}
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpenDeleteModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  onClick={confirmDelete}
                  className="bg-red-500 hover:bg-red-600 text-white shadow-red-500/25 border-transparent"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Delete Record
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicRecords;