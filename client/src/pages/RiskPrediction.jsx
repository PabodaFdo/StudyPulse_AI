import { useState, useEffect } from 'react';
import { ShieldAlert, TrendingUp, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { riskService } from '../services/risk.service';
import { subjectService } from '../services/subject.service';

const RiskPrediction = () => {
  const [formData, setFormData] = useState({
    attendancePercentage: 85,
    assignmentAverage: 75,
    quizAverage: 70,
    studyHoursPerWeek: 15,
    missedDeadlines: 1,
    focusSessionsCompleted: 5,
    previousExamMark: 65,
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [prediction, setPrediction] = useState(null);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [riskHistory, setRiskHistory] = useState([]);
  const [currentTrend, setCurrentTrend] = useState(null);
  const [isSavingHistory, setIsSavingHistory] = useState(false);

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

  useEffect(() => {
    if (selectedSubjectId) {
      const fetchHistory = async () => {
        try {
          const history = await riskService.getRiskHistory(selectedSubjectId);
          setRiskHistory(history);
          if (history.length > 0) {
            const latest = history[0];
            setPrediction({
              riskLevel: latest.riskLevel,
              confidence: latest.riskScore / 100,
              isFromHistory: true,
              createdAt: latest.createdAt,
              reasons: ['Based on your latest saved risk prediction.'],
              recommendations: ['Run a new prediction with latest data to refresh insights.']
            });
            setCurrentTrend({ trend: latest.trend, trendMessage: latest.trendMessage });
          } else {
            setPrediction(null);
            setCurrentTrend(null);
          }
        } catch (err) {
          console.error("Failed to fetch risk history", err);
        }
      };
      fetchHistory();
    } else {
      setRiskHistory([]);
      setPrediction(null);
      setCurrentTrend(null);
    }
  }, [selectedSubjectId]);

  const handleAutoFill = async () => {
    if (!selectedSubjectId) {
      toast.error('Please select a subject first.');
      return;
    }
    setIsAutoFilling(true);
    try {
      const analytics = await subjectService.getSubjectAnalytics(selectedSubjectId);
      const formatNum = (val, decimals) => val != null && !isNaN(val) ? Number(Number(val).toFixed(decimals)) : null;
      
      setFormData(prev => ({
        ...prev,
        attendancePercentage: formatNum(analytics.studyEngagementScore ?? analytics.attendancePercentage, 1) ?? prev.attendancePercentage,
        assignmentAverage: formatNum(analytics.assessmentWeightedAverage ?? analytics.avgMark, 1) ?? prev.assignmentAverage,
        quizAverage: formatNum(analytics.quizAttemptAverage ?? analytics.quizAverage, 1) ?? prev.quizAverage,
        studyHoursPerWeek: formatNum(analytics.studyHours ?? analytics.studyHoursPerWeek, 2) ?? prev.studyHoursPerWeek,
        focusSessionsCompleted: formatNum(analytics.focusSessions ?? analytics.focusSessionsCompleted, 0) ?? prev.focusSessionsCompleted,
        previousExamMark: formatNum(analytics.examMark, 1) ?? prev.previousExamMark
      }));
      toast.success('Risk prediction form filled from your study data.');
    } catch {
      toast.error('Failed to fetch subject data for auto-fill.');
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    const payload = {
      attendancePercentage: Number(formData.attendancePercentage),
      assignmentAverage: Number(formData.assignmentAverage),
      quizAverage: Number(formData.quizAverage),
      studyHoursPerWeek: Number(formData.studyHoursPerWeek),
      missedDeadlines: 0,
      focusSessionsCompleted: Number(formData.focusSessionsCompleted),
      previousExamMark: Number(formData.previousExamMark),
    };

    if (payload.attendancePercentage < 0 || payload.attendancePercentage > 100) {
      toast.error("Attendance percentage must be between 0 and 100.");
      setLoading(false);
      return;
    }
    if (payload.assignmentAverage < 0 || payload.assignmentAverage > 100) {
      toast.error("Assignment average must be between 0 and 100.");
      setLoading(false);
      return;
    }
    if (payload.quizAverage < 0 || payload.quizAverage > 100) {
      toast.error("Quiz average must be between 0 and 100.");
      setLoading(false);
      return;
    }
    if (payload.previousExamMark < 0 || payload.previousExamMark > 100) {
      toast.error("Previous exam mark must be between 0 and 100.");
      setLoading(false);
      return;
    }
    if (payload.studyHoursPerWeek < 0) {
      toast.error("Study hours per week must be 0 or greater.");
      setLoading(false);
      return;
    }
    if (payload.missedDeadlines < 0) {
      toast.error("Missed deadlines must be 0 or greater.");
      setLoading(false);
      return;
    }
    if (payload.focusSessionsCompleted < 0) {
      toast.error("Focus sessions completed must be 0 or greater.");
      setLoading(false);
      return;
    }

    try {
      const result = await riskService.predictRisk(payload);
      setPrediction(result);

      // Trend Calculation
      let trend = "First Prediction";
      let trendMessage = "This is your first saved risk prediction for this subject. Future predictions will show trend changes.";
      
      const previousPrediction = riskHistory.length > 0 ? riskHistory[0] : null;

      if (previousPrediction) {
        const prevScore = previousPrediction.riskScore;
        const prevLevel = previousPrediction.riskLevel;
        const newScore = result.confidence * 100;
        const newLevel = result.riskLevel;

        const scoreDiff = newScore - prevScore;

        const isLevelImproved = 
          (prevLevel === 'High Risk' && (newLevel === 'Medium Risk' || newLevel === 'Low Risk')) ||
          (prevLevel === 'Medium Risk' && newLevel === 'Low Risk');
        
        const isLevelWorsened = 
          (prevLevel === 'Low Risk' && (newLevel === 'Medium Risk' || newLevel === 'High Risk')) ||
          (prevLevel === 'Medium Risk' && newLevel === 'High Risk');

        if (scoreDiff <= -5 || isLevelImproved) {
          trend = "Improving";
          trendMessage = "Risk is improving because your latest risk probability is lower than the previous prediction.";
        } else if (scoreDiff >= 5 || isLevelWorsened) {
          trend = "Declining";
          trendMessage = "Risk is increasing because your latest risk probability is higher than the previous prediction.";
        } else {
          trend = "Stable";
          trendMessage = "Risk is stable. Your recent academic activity is similar to the previous prediction.";
        }
      }

      setCurrentTrend({ trend, trendMessage });

      // Save History
      if (selectedSubjectId) {
        setIsSavingHistory(true);
        try {
          const savePayload = {
            subjectId: selectedSubjectId,
            riskScore: result.confidence * 100,
            riskLevel: result.riskLevel,
            trend,
            trendMessage,
            studyEngagement: payload.attendancePercentage,
            assessmentAverage: payload.assignmentAverage,
            quizAverage: payload.quizAverage,
            studyHoursPerWeek: payload.studyHoursPerWeek,
            focusSessionsCompleted: payload.focusSessionsCompleted,
            previousExamMark: payload.previousExamMark
          };
          const savedRecord = await riskService.saveRiskHistory(savePayload);
          setRiskHistory(prev => [savedRecord, ...prev]);
        } catch (err) {
          console.error("Failed to save risk history", err);
          toast.error("Failed to save prediction history");
        } finally {
          setIsSavingHistory(false);
        }
      }

    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.data?.detail || err.message || 'Failed to predict risk. Please try again.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="ML Risk Prediction"
        subtitle="Early academic failure warning predictions evaluated by StudyPulse ML Service."
        icon={ShieldAlert}
      />

      <form onSubmit={handleSubmit} className="app-panel p-6 space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
          Risk Prediction is calculated using your real study activity, assessments, quizzes, focus sessions, and notes.
        </p>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm text-slate-700 dark:text-slate-200 mb-1">Select Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className="w-full px-4 py-3 app-input rounded-xl focus:outline-none focus:border-cyan-400 text-slate-800 dark:text-white placeholder-slate-400 disabled:opacity-50"
              disabled={isManualMode}
            >
              <option value="">Select a subject...</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name || subject.subjectName}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={handleAutoFill}
              disabled={!selectedSubjectId || isAutoFilling || isManualMode}
              className={`px-6 py-3 rounded-xl font-bold transition-all h-[50px] ${
                !selectedSubjectId || isAutoFilling || isManualMode
                  ? "bg-slate-100 dark:bg-slate-700 text-slate-400 cursor-not-allowed border border-slate-200 dark:border-slate-600"
                  : "bg-cyan-500 hover:bg-cyan-600 text-white dark:!text-slate-900 shadow-sm dark:shadow-lg dark:shadow-cyan-500/20"
              }`}
            >
              {isAutoFilling ? "Filling..." : "Auto Fill from My Data"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={isManualMode} 
              onChange={(e) => setIsManualMode(e.target.checked)} 
            />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500"></div>
            <span className="ml-3 text-sm font-medium text-slate-700 dark:text-slate-200">Manual Test Mode</span>
          </label>
          <span className="text-xs text-slate-500 dark:text-slate-400 italic ml-2">
            Manual Test Mode is only for testing different risk scenarios.
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.keys(formData).filter(key => key !== 'missedDeadlines').map((key) => {
            let label = key.replace(/([A-Z])/g, ' $1').trim();
            if (key === 'attendancePercentage') label = 'Study Engagement (%)';

            return (
              <div key={key} className="flex flex-col space-y-1">
                <label className="block text-sm text-slate-700 dark:text-slate-200 capitalize">
                  {label}
                </label>
                <input 
                  type="number" 
                  name={key} 
                  value={formData[key]} 
                  onChange={handleChange}
                  step={['focusSessionsCompleted'].includes(key) ? "1" : "any"}
                  className={`w-full px-4 py-3 app-input rounded-xl focus:outline-none focus:border-cyan-400 text-slate-800 dark:text-white placeholder-slate-400 ${!isManualMode ? 'bg-slate-50 opacity-70 cursor-not-allowed dark:bg-slate-950/60' : ''}`}
                  required
                  readOnly={!isManualMode}
                />
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="px-6 py-4 rounded-xl bg-purple-500 hover:bg-purple-600 !text-white font-bold transition-all shadow-lg shadow-purple-500/20"
          >
            {loading ? 'Predicting...' : 'Predict Academic Risk'}
          </button>
          {error && <p className="text-danger-400 text-xs">{error}</p>}
        </div>
      </form>

      {prediction ? (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Risk Card */}
          <div className={`app-card p-6 text-center space-y-4 ${
            prediction.riskLevel === 'High Risk'
              ? 'border-red-300 bg-red-50/90 dark:border-red-500/30 dark:bg-red-500/10'
              : prediction.riskLevel === 'Medium Risk'
              ? 'border-amber-300 bg-amber-50/90 dark:border-amber-500/30 dark:bg-amber-500/10'
              : 'border-emerald-300 bg-emerald-50/90 dark:border-emerald-500/30 dark:bg-emerald-500/10'
          }`}>
            <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${
              prediction.riskLevel === 'High Risk'
                ? 'bg-red-100 text-red-500 dark:bg-red-500/20 dark:text-red-300'
                : prediction.riskLevel === 'Medium Risk'
                ? 'bg-amber-100 text-amber-500 dark:bg-amber-500/20 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-300'
            }`}>
              <AlertTriangle className="h-6 w-6 animate-pulse-soft" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-gray-300 font-bold uppercase tracking-wider block">PREDICTED RISK STATUS</span>
              <h3 className={`mt-1 text-2xl font-extrabold flex items-baseline gap-2 ${
                prediction.riskLevel === 'High Risk'
                  ? 'text-red-600 dark:text-red-300'
                  : prediction.riskLevel === 'Medium Risk'
                  ? 'text-amber-600 dark:text-amber-300'
                  : 'text-emerald-600 dark:text-emerald-300'
              }`}>
                {prediction.riskLevel} <span className="text-lg font-bold opacity-80">(Risk Probability: {(prediction.confidence * 100).toFixed(0)}%)</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-300 mt-0.5">Calculated: {prediction.createdAt ? new Date(prediction.createdAt).toLocaleDateString() : 'Just now'}</p>
            </div>
          </div>

          {/* Trend Card */}
          {currentTrend && (
            <div className={`lg:col-span-3 app-card p-5 flex flex-col sm:flex-row items-center gap-4 ${
              currentTrend.trend === 'Improving' 
                ? 'border-emerald-300 bg-emerald-50/90 dark:border-emerald-500/30 dark:bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                : currentTrend.trend === 'Declining'
                ? 'border-red-300 bg-red-50/90 dark:border-red-500/30 dark:bg-red-500/10 text-red-800 dark:text-red-200'
                : currentTrend.trend === 'Stable'
                ? 'border-cyan-300 bg-cyan-50/90 dark:border-cyan-500/30 dark:bg-cyan-500/10 text-cyan-800 dark:text-cyan-200'
                : 'border-slate-300 bg-slate-50/90 dark:border-slate-500/30 dark:bg-slate-500/10 text-slate-800 dark:text-slate-200'
            }`}>
              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Risk Trend: {currentTrend.trend}
                  {isSavingHistory && <span className="text-xs font-normal opacity-70 ml-2 animate-pulse">(Saving history...)</span>}
                </h3>
                <p className="text-sm opacity-90">{currentTrend.trendMessage}</p>
              </div>
            </div>
          )}

          {/* Factors Breakdown */}
          <div className="lg:col-span-2 app-panel p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Key Academic Indicators (Reasons)</h3>
            <div className="space-y-3">
              {prediction.reasons && prediction.reasons.length > 0 ? prediction.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl app-soft-card p-3.5">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{reason}</h4>
                  </div>
                  <span className="rounded border border-amber-400 bg-amber-100 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:border-warning-500/30 dark:bg-warning-500/20 dark:text-warning-300">Risk Factor</span>
                </div>
              )) : (
                <p className="text-gray-400 text-sm">No specific risk indicators found.</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-3 app-panel p-5 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">AI Correction Strategy</h3>
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              {prediction.recommendations && prediction.recommendations.length > 0 ? prediction.recommendations.map((rec, i) => (
                <div key={i} className="group flex flex-col justify-between rounded-xl app-soft-card p-4 transition-all hover:border-brand-300 hover:bg-brand-50 dark:hover:border-white/20 dark:hover:bg-white/10">
                  <div>
                    <h4 className="font-semibold text-slate-800 dark:text-white">{rec}</h4>
                  </div>
                  <span
                    className="mt-4 self-start text-xs font-extrabold tracking-wide text-cyan-600 transition-colors group-hover:text-cyan-700 dark:!text-cyan-300 dark:group-hover:!text-cyan-200"
                  >
                    {prediction.riskLevel === 'Low Risk' ? 'Maintain Plan →' : 'Action Required →'}
                  </span>
                </div>
              )) : (
                <p className="text-gray-400 text-sm">Keep up the good work!</p>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Default/Placeholder before prediction */}
          <div className="app-card p-6 text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-500 dark:text-purple-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider block">PREDICTED RISK STATUS</span>
              <h3 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1">Pending</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submit form to predict</p>
            </div>
          </div>

          <div className="lg:col-span-2 app-panel p-6 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Key Academic Indicators</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl app-soft-card p-3.5">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Awaiting prediction data...</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Risk History Section */}
      {selectedSubjectId && riskHistory.length > 0 && (
        <div className="mt-10">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-purple-500" />
            Risk History
          </h3>
          <div className="app-panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Risk Level</th>
                    <th className="px-6 py-4">Risk Probability</th>
                    <th className="px-6 py-4">Trend</th>
                    <th className="px-6 py-4">Engagement</th>
                    <th className="px-6 py-4">Assessments</th>
                    <th className="px-6 py-4">Quizzes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {riskHistory.map((history) => (
                    <tr key={history.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {new Date(history.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${
                          history.riskLevel === 'High Risk' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          history.riskLevel === 'Medium Risk' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {history.riskLevel}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                        {Math.round(history.riskScore)}%
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 rounded-md text-xs font-bold ${
                          history.trend === 'Improving' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          history.trend === 'Declining' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                          history.trend === 'Stable' ? 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' :
                          'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {history.trend}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{history.studyEngagement}%</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{history.assessmentAverage}%</td>
                      <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{history.quizAverage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskPrediction;
