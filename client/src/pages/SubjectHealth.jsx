import { useState, useEffect } from 'react';
import { HeartPulse, Activity, AlertTriangle, CheckCircle, XCircle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { subjectHealthService } from '../services/subjectHealth.service';
import { subjectService } from '../services/subject.service';

const defaultFormData = {
  attendancePercentage: "",
  averageMark: "",
  quizAverage: "",
  studyHoursThisWeek: "",
  focusSessionsCompleted: "",
  notesCount: "",
  missedDeadlines: ""
};

const SubjectHealth = () => {
  const [formData, setFormData] = useState(defaultFormData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await subjectService.getSubjects();
        setSubjects(data);
      } catch (err) {
        console.error('Failed to fetch subjects', err);
      }
    };
    fetchSubjects();
  }, []);

  const handleAutoFill = async () => {
    if (!selectedSubjectId) {
      toast.error('Please select a subject first.');
      return;
    }
    setIsAutoFilling(true);
    try {
      const analytics = await subjectService.getSubjectAnalytics(selectedSubjectId);
      
      if (
        !analytics.attendancePercentage && 
        !analytics.averageMark && 
        !analytics.quizAverage && 
        !analytics.studyHoursPerWeek && 
        !analytics.focusSessionsCompleted && 
        !analytics.notesCount &&
        !analytics.examMark
      ) {
        toast.error('No academic data found for this subject. You can enter values manually.');
      } else {
        setFormData({
          attendancePercentage: analytics.attendancePercentage || 0,
          averageMark: analytics.averageMark || 0,
          quizAverage: analytics.quizAverage || 0,
          studyHoursThisWeek: analytics.studyHoursPerWeek || 0,
          focusSessionsCompleted: analytics.focusSessionsCompleted || 0,
          notesCount: analytics.notesCount || 0,
          missedDeadlines: analytics.missedDeadlines || 0,
        });
        toast.success('Subject health form filled from your study data.');
      }
    } catch (err) {
      toast.error('Failed to fetch subject data for auto-fill.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleReset = () => {
    setFormData(defaultFormData);
    setResult(null);
    setError(null);
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const selectedSubject = subjects.find((s) => String(s.id) === String(selectedSubjectId));
      const subjectName = selectedSubject?.name || selectedSubject?.subjectName || "Unknown Subject";

      const payload = {
        subjectName: subjectName,
        attendancePercentage: Number(formData.attendancePercentage),
        averageMark: Number(formData.averageMark),
        quizAverage: Number(formData.quizAverage),
        studyHoursThisWeek: Number(formData.studyHoursThisWeek),
        focusSessionsCompleted: Number(formData.focusSessionsCompleted),
        notesCount: Number(formData.notesCount),
        missedDeadlines: Number(formData.missedDeadlines),
      };

      const data = await subjectHealthService.calculateSubjectHealth(payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to calculate subject health score.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColorClass = (status) => {
    switch (status) {
      case 'Healthy':
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Needs Attention':
        return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Critical':
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      default:
        return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Healthy': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'Needs Attention': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'Critical': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Subject Health"
        subtitle="Analyze your subject health score based on your study habits and performance."
        icon={HeartPulse}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Form Section */}
        <div className="bg-white/80 dark:bg-slate-900/70 border border-purple-100 dark:border-slate-700 shadow-xl shadow-purple-100/40 dark:shadow-none p-6 rounded-2xl">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-white mb-6">Calculate Score</h3>
          
          <div className="mb-6 space-y-3">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Select Subject
            </label>

            <div className="flex flex-col md:flex-row gap-3">
              <select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                className="w-full md:flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400"
              >
                <option value="">Select a subject...</option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name || subject.subjectName}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={handleAutoFill}
                disabled={!selectedSubjectId || isAutoFilling}
                className={`w-full md:w-auto px-5 py-3 rounded-xl font-bold transition-all ${
                  !selectedSubjectId || isAutoFilling
                    ? "bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300 cursor-not-allowed"
                    : "bg-cyan-500 hover:bg-cyan-600 !text-slate-900 dark:text-white shadow-lg shadow-cyan-500/20"
                }`}
              >
                {isAutoFilling ? "Filling..." : "Auto Fill from My Data"}
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Attendance (%)</label>
                <input 
                  type="number" 
                  name="attendancePercentage" 
                  value={formData.attendancePercentage} 
                  onChange={handleChange} 
                  required
                  step="any"
                  min="0" max="100"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Avg Mark (%)</label>
                <input 
                  type="number" 
                  name="averageMark" 
                  value={formData.averageMark} 
                  onChange={handleChange} 
                  required
                  step="any"
                  min="0" max="100"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Quiz Avg (%)</label>
                <input 
                  type="number" 
                  name="quizAverage" 
                  value={formData.quizAverage} 
                  onChange={handleChange} 
                  required
                  step="any"
                  min="0" max="100"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Study Hours</label>
                <input 
                  type="number" 
                  name="studyHoursThisWeek" 
                  value={formData.studyHoursThisWeek} 
                  onChange={handleChange} 
                  required
                  step="any"
                  min="0"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Focus Sessions</label>
                <input 
                  type="number" 
                  name="focusSessionsCompleted" 
                  value={formData.focusSessionsCompleted} 
                  onChange={handleChange} 
                  required
                  step="1"
                  min="0"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Notes Count</label>
                <input 
                  type="number" 
                  name="notesCount" 
                  value={formData.notesCount} 
                  onChange={handleChange} 
                  required
                  step="1"
                  min="0"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Missed Deadlines</label>
                <input 
                  type="number" 
                  name="missedDeadlines" 
                  value={formData.missedDeadlines} 
                  onChange={handleChange} 
                  required
                  step="1"
                  min="0"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 rounded-xl bg-purple-500 hover:bg-purple-600 !text-slate-900 dark:text-white font-bold transition-all shadow-lg shadow-purple-500/20"
              >
                {loading ? 'Calculating...' : 'Calculate Health'}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={loading}
                className="w-full px-6 py-4 rounded-xl border border-slate-600 bg-slate-900/60 hover:bg-slate-800 !text-slate-700 dark:text-slate-200 font-bold transition-all"
              >
                Reset
              </button>
            </div>
            
            {error && (
              <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
                {error}
              </div>
            )}
          </form>
        </div>

        {/* Results Section */}
        <div className="bg-white/80 dark:bg-slate-900/70 border border-purple-100 dark:border-slate-700 text-slate-900 dark:text-slate-900 dark:text-white p-6 rounded-2xl flex flex-col">
          <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-900 dark:text-white mb-4">Analysis Results</h3>
          
          {!result ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 space-y-3">
              <Activity className="w-12 h-12 opacity-50" />
              <p className="text-sm">Enter your metrics to see your subject health analysis.</p>
            </div>
          ) : (
            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-slate-900 dark:text-white">{result.subjectName || 'Subject'}</h4>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Health Score: {Math.round(result.healthScore)}%</p>
                </div>
                <div className={`px-3 py-1.5 rounded-full border flex items-center gap-2 font-medium text-sm ${getStatusColorClass(result.status)}`}>
                  {getStatusIcon(result.status)}
                  {result.status}
                </div>
              </div>

              {result.strengths?.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" /> Strengths
                  </h5>
                  <ul className="list-disc list-inside text-sm text-slate-700 dark:text-gray-300 space-y-1">
                    {result.strengths.map((str, idx) => (
                      <li key={idx}>{str}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.concerns?.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm text-red-600 dark:text-red-400 mb-2 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Concerns
                  </h5>
                  <ul className="list-disc list-inside text-sm text-slate-700 dark:text-gray-300 space-y-1">
                    {result.concerns.map((con, idx) => (
                      <li key={idx}>{con}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations?.length > 0 && (
                <div>
                  <h5 className="font-medium text-sm text-amber-600 dark:text-amber-400 mb-2 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" /> Recommendations
                  </h5>
                  <ul className="list-disc list-inside text-sm text-slate-700 dark:text-gray-300 space-y-1">
                    {result.recommendations.map((rec, idx) => (
                      <li key={idx}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectHealth;
