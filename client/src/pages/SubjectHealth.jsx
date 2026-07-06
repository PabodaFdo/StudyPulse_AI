import { useState, useEffect } from 'react';
import { HeartPulse, Activity, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { subjectHealthService } from '../services/subjectHealth.service';
import { subjectService } from '../services/subject.service';

const defaultFormData = {
  attendancePercentage: "",
  averageMark: "",
  studyHoursThisWeek: "",
  focusSessionsCompleted: "",
  notesCount: ""
};

const SubjectHealth = () => {
  const [formData, setFormData] = useState(defaultFormData);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [quizInfo, setQuizInfo] = useState(null);
  const [showQuizInfo, setShowQuizInfo] = useState(false);

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
        analytics.attendancePercentage === null && 
        analytics.averageMark === null && 
        analytics.quizAverage === null && 
        analytics.studyHoursPerWeek === null && 
        analytics.focusSessionsCompleted === null && 
        analytics.notesCount === null &&
        analytics.examMark === null
      ) {
        toast.error('No academic data found for this subject. You can enter values manually.');
      } else {
        let calculatedAvgMark = formData.averageMark;
        if (analytics.avgMark !== null) {
          calculatedAvgMark = analytics.avgMark;
        }

        setFormData({
          attendancePercentage: analytics.attendancePercentage !== null ? analytics.attendancePercentage : formData.attendancePercentage,
          averageMark: calculatedAvgMark,
          studyHoursThisWeek: analytics.studyHours !== null ? analytics.studyHours : (analytics.studyHoursPerWeek !== null ? analytics.studyHoursPerWeek : formData.studyHoursThisWeek),
          focusSessionsCompleted: analytics.focusSessions !== null ? analytics.focusSessions : (analytics.focusSessionsCompleted !== null ? analytics.focusSessionsCompleted : formData.focusSessionsCompleted),
          notesCount: analytics.notesCount !== null ? analytics.notesCount : formData.notesCount
        });
        setQuizInfo(analytics);
        setShowQuizInfo(true);
        toast.success('Subject health form filled from your study data.');
      }
    } catch {
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
    setShowQuizInfo(false);
    setQuizInfo(null);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.attendancePercentage === "") return toast.error('Please enter Attendance before calculating subject health.');
    if (formData.averageMark === "") return toast.error('Please enter Avg Mark before calculating subject health.');
    if (formData.studyHoursThisWeek === "") return toast.error('Please enter Study Hours before calculating subject health.');
    if (formData.focusSessionsCompleted === "") return toast.error('Please enter Focus Sessions before calculating subject health.');
    if (formData.notesCount === "") return toast.error('Please enter Notes Count before calculating subject health.');

    if (formData.attendancePercentage < 0 || formData.attendancePercentage > 100) return toast.error('Attendance must be between 0 and 100.');
    if (formData.averageMark < 0 || formData.averageMark > 100) return toast.error('Average mark must be between 0 and 100.');
    if (formData.studyHoursThisWeek < 0) return toast.error('Study hours must be 0 or greater.');
    if (formData.focusSessionsCompleted < 0) return toast.error('Focus sessions must be 0 or greater.');
    if (formData.notesCount < 0) return toast.error('Notes count must be 0 or greater.');

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
        quizAverage: Number(formData.averageMark),
        studyHoursThisWeek: Number(formData.studyHoursThisWeek),
        focusSessionsCompleted: Number(formData.focusSessionsCompleted),
        notesCount: Number(formData.notesCount),
        missedDeadlines: 0,
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
      case 'Good':
        return 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20';
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
      case 'Good': return <CheckCircle className="w-5 h-5 text-cyan-500" />;
      case 'Needs Attention': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'Critical': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getSourceLabel = (sourceKey) => {
    if (!quizInfo || !showQuizInfo) return null;
    const source = quizInfo[sourceKey];
    if (source === 'academic_records') return <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">✓ From academic records</p>;
    if (source === 'quiz_attempts') return <p className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-1">✓ From saved quiz attempts</p>;
    if (source === 'smart_notes') return <p className="text-[10px] text-purple-600 dark:text-purple-400 mt-1">✓ From Smart Notes</p>;
    if (source === 'focus_sessions') return <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">✓ From Focus Timer</p>;
    if (source === 'study_engagement') return <p className="text-[10px] text-indigo-600 dark:text-indigo-400 mt-1">✓ Calculated from your activity in StudyPulse AI</p>;
    if (source === 'manual_required' || source === 'none' || !source) {
      if (sourceKey === 'attendanceSource') return <p className="text-[10px] text-slate-500 mt-1">Calculated from quiz attempts, focus sessions, smart notes, assessments, and recent study activity.</p>;
      if (sourceKey === 'avgMarkSource' || sourceKey === 'assignmentSource' || sourceKey === 'examMarkSource') {
        if (quizInfo.avgMarkSource === 'assessments') {
          return <p className="text-[10px] text-blue-600 dark:text-blue-400 mt-1">✓ From Assessment Tracker</p>;
        } else if (quizInfo.avgMarkSource === 'quiz_attempts') {
          return <p className="text-[10px] text-cyan-600 dark:text-cyan-400 mt-1">✓ From saved quiz attempts</p>;
        } else if (quizInfo.avgMarkSource === 'academic_records') {
          return <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">✓ From academic records</p>;
        } else {
          return <p className="text-[10px] text-slate-500 mt-1">Enter manually</p>;
        }
      }
      if (sourceKey === 'quizAverageSource') return <p className="text-[10px] text-slate-500 mt-1">Enter manually</p>;
      if (sourceKey === 'studyHoursSource' || sourceKey === 'focusSessionsSource') return <p className="text-[10px] text-slate-500 mt-1">Enter manually or use Focus Timer first</p>;
      if (sourceKey === 'notesCountSource') return <p className="text-[10px] text-slate-500 mt-1">No Smart Notes found</p>;
      if (sourceKey === 'missedDeadlinesSource') return <p className="text-[10px] text-slate-500 mt-1">Enter manually</p>;
      return <p className="text-[10px] text-slate-500 mt-1">Enter manually</p>;
    }
    return null;
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

          {showQuizInfo && quizInfo?.avgMarkSource === 'assessments' && (
            <div className="mb-4 p-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              <p className="text-sm font-semibold mb-2">Average mark is based on weighted assessments.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div><span className="opacity-70">Assessments:</span> <strong>{quizInfo.assessmentCount}</strong></div>
                <div>
                  <span className="opacity-70">Total Weight:</span>{' '}
                  <strong className={quizInfo.assessmentTotalWeight > 100 ? 'text-red-600 dark:text-red-400 font-extrabold' : ''}>
                    {quizInfo.assessmentTotalWeight}%
                  </strong>
                </div>
                <div><span className="opacity-70">Avg Mark:</span> <strong>{quizInfo.assessmentWeightedAverage}%</strong></div>
              </div>
              {quizInfo.assessmentTotalWeight > 100 && (
                <div className="mt-3 p-3 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <p className="text-xs font-semibold">Warning: Assessment weights exceed 100%. Please fix weights for accurate health calculation.</p>
                </div>
              )}
            </div>
          )}

          {showQuizInfo && quizInfo?.avgMarkSource === 'quiz_attempts' && (
            <div className="mb-4 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-800 text-cyan-700 dark:text-cyan-300">
              <p className="text-sm font-semibold mb-2">Average mark is based on saved quiz attempts.</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                <div><span className="opacity-70">Attempts:</span> <strong>{quizInfo.quizAttemptCount}</strong></div>
                <div><span className="opacity-70">Latest Score:</span> <strong>{Math.round(quizInfo.latestQuizScore)}%</strong></div>
                <div><span className="opacity-70">Best Score:</span> <strong>{Math.round(quizInfo.bestQuizScore)}%</strong></div>
                <div><span className="opacity-70">Average Score:</span> <strong>{Math.round(quizInfo.quizAttemptAverage)}%</strong></div>
              </div>
            </div>
          )}

          {showQuizInfo && (
            Object.values({
              a: quizInfo.attendanceSource,
              b: quizInfo.avgMarkSource,
              d: quizInfo.studyHoursSource,
              e: quizInfo.focusSessionsSource,
              f: quizInfo.notesCountSource
            }).some(val => val === 'none' || val === 'manual_required')
          ) && (
            <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
              <p className="text-sm font-medium flex items-center gap-1.5">Subject Health is calculated using your real study activity, assessments, quizzes, focus sessions, flashcards, and notes.</p>
              <p className="text-xs text-slate-500 mt-1">Flashcard Activity is calculated from your reviewed cards, review attempts, and accuracy.</p>
              <p className="text-xs text-slate-500 mt-1">Summary Activity is calculated from reviewed summaries, reading time, and recent review activity.</p>
            </div>
          )}

          {showQuizInfo && quizInfo?.studyEngagementScore !== undefined && (
            <div className="mb-4 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-indigo-900 dark:text-indigo-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold">Study Engagement Breakdown</h4>
                <span className="text-xs font-bold px-2 py-1 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                  Level: {quizInfo.studyEngagementLevel}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between"><span className="opacity-80">Quiz Activity:</span> <strong>{quizInfo.studyEngagementBreakdown?.quizActivity} / 20</strong></div>
                <div className="flex justify-between"><span className="opacity-80">Focus Activity:</span> <strong>{quizInfo.studyEngagementBreakdown?.focusActivity} / 15</strong></div>
                <div className="flex justify-between"><span className="opacity-80">Notes Activity:</span> <strong>{quizInfo.studyEngagementBreakdown?.notesActivity} / 15</strong></div>
                <div className="flex justify-between"><span className="opacity-80">Flashcard Activity:</span> <strong>{quizInfo.studyEngagementBreakdown?.flashcardActivity} / 15</strong></div>
                <div className="flex justify-between"><span className="opacity-80">Summary Activity:</span> <strong>{quizInfo.studyEngagementBreakdown?.summaryActivity} / 10</strong></div>
                <div className="flex justify-between"><span className="opacity-80">Assessment Activity:</span> <strong>{quizInfo.studyEngagementBreakdown?.assessmentActivity} / 15</strong></div>
                <div className="flex justify-between"><span className="opacity-80">Recent Activity:</span> <strong>{quizInfo.studyEngagementBreakdown?.recentActivity} / 10</strong></div>
              </div>
              <div className="mt-3 pt-2 border-t border-indigo-200 dark:border-indigo-800 flex justify-between font-bold">
                <span>Total Score:</span>
                <span>{quizInfo.studyEngagementScore} / 100</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Study Engagement (%)</label>
                <input 
                  type="number" 
                  name="attendancePercentage" 
                  value={formData.attendancePercentage} 
                  onChange={handleChange} 
                  step="any"
                  min="0" max="100"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400"
                />
                {getSourceLabel('attendanceSource')}
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Avg Mark (%)</label>
                <input 
                  type="number" 
                  name="averageMark" 
                  value={formData.averageMark} 
                  onChange={handleChange} 
                  step="any"
                  min="0" max="100"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400"
                />
                {getSourceLabel('avgMarkSource')}
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Study Hours</label>
                <input 
                  type="number" 
                  name="studyHoursThisWeek" 
                  value={formData.studyHoursThisWeek} 
                  onChange={handleChange} 
                  step="any"
                  min="0"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400"
                />
                {getSourceLabel('studyHoursSource')}
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Focus Sessions</label>
                <input 
                  type="number" 
                  name="focusSessionsCompleted" 
                  value={formData.focusSessionsCompleted} 
                  onChange={handleChange} 
                  step="1"
                  min="0"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400"
                />
                {getSourceLabel('focusSessionsSource')}
              </div>
              <div>
                <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Notes Count</label>
                <input 
                  type="number" 
                  name="notesCount" 
                  value={formData.notesCount} 
                  onChange={handleChange} 
                  step="1"
                  min="0"
                  className="w-full px-4 py-3 bg-white dark:bg-slate-950/60 border border-slate-300 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-cyan-400 text-slate-900 dark:text-white placeholder-slate-400"
                />
                {getSourceLabel('notesCountSource')}
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
