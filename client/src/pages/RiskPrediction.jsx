import { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, TrendingUp, AlertTriangle, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import { riskService } from '../services/risk.service';

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
      missedDeadlines: Number(formData.missedDeadlines),
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

      <form onSubmit={handleSubmit} className="bg-slate-900/70 border border-slate-700 p-6 rounded-2xl space-y-4">
        <p className="text-sm text-slate-300 mb-6">
          Enter your current academic and study metrics manually to predict your academic risk.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.keys(formData).map((key) => (
            <div key={key} className="flex flex-col space-y-1">
              <label className="block text-sm text-slate-200 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input 
                type="number" 
                name={key} 
                value={formData[key]} 
                onChange={handleChange}
                step={['missedDeadlines', 'focusSessionsCompleted'].includes(key) ? "1" : "any"}
                className="w-full px-4 py-3 bg-slate-950/60 border border-slate-600 rounded-xl focus:outline-none focus:border-cyan-400 text-white placeholder-slate-400"
                required
              />
            </div>
          ))}
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
          <div className={`rounded-2xl border p-6 text-center shadow-sm backdrop-blur-xl space-y-4 ${
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
              <h3 className={`mt-1 text-2xl font-extrabold ${
                prediction.riskLevel === 'High Risk'
                  ? 'text-red-600 dark:text-red-300'
                  : prediction.riskLevel === 'Medium Risk'
                  ? 'text-amber-600 dark:text-amber-300'
                  : 'text-emerald-600 dark:text-emerald-300'
              }`}>
                {prediction.riskLevel} ({(prediction.confidence * 100).toFixed(0)}%)
              </h3>
              <p className="text-xs text-slate-500 dark:text-gray-300 mt-0.5">Calculated: Just now</p>
            </div>
          </div>

          {/* Factors Breakdown */}
          <div className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-white/[0.02] space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Key Academic Indicators (Reasons)</h3>
            <div className="space-y-3">
              {prediction.reasons && prediction.reasons.length > 0 ? prediction.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 p-3.5 shadow-sm dark:border-white/5 dark:bg-white/[0.01]">
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
          <div className="lg:col-span-3 rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-white/[0.02] space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">AI Correction Strategy</h3>
            <div className="grid gap-4 sm:grid-cols-3 text-xs">
              {prediction.recommendations && prediction.recommendations.length > 0 ? prediction.recommendations.map((rec, i) => (
                <div key={i} className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white/90 p-4 shadow-sm transition-all hover:border-brand-300 hover:bg-brand-50 dark:border-white/5 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10">
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
          <div className="rounded-2xl bg-slate-900/70 border border-slate-700 text-slate-200 p-6 text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/15 text-purple-300">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">PREDICTED RISK STATUS</span>
              <h3 className="text-2xl font-extrabold text-slate-100 mt-1">Pending</h3>
              <p className="text-xs text-slate-400 mt-0.5">Submit form to predict</p>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-white/[0.02] space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Key Academic Indicators</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 p-3.5 shadow-sm dark:border-white/5 dark:bg-white/[0.01]">
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 dark:text-white">Awaiting prediction data...</h4>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskPrediction;
