import { useState } from 'react';
import { ShieldAlert, CheckCircle, TrendingUp, AlertTriangle } from 'lucide-react';
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

    try {
      const result = await riskService.predictRisk(payload);
      setPrediction(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to predict risk. Please try again.');
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

      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm backdrop-blur-xl dark:border-white/5 dark:bg-white/[0.02] space-y-4">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Enter Metrics for Prediction</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.keys(formData).map((key) => (
            <div key={key} className="flex flex-col space-y-1">
              <label className="text-xs text-slate-500 dark:text-gray-400 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </label>
              <input 
                type="number" 
                name={key} 
                value={formData[key]} 
                onChange={handleChange}
                className="rounded-lg border border-slate-200 bg-white p-2 text-sm text-slate-900 focus:border-brand-500 focus:outline-none dark:border-white/10 dark:bg-navy-900 dark:text-white"
                required
              />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 pt-2">
          <button 
            type="submit" 
            disabled={loading}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm"
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
        <div className="grid gap-6 lg:grid-cols-3 opacity-50">
          {/* Default/Placeholder before prediction */}
          <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-6 text-center shadow-sm backdrop-blur-xl dark:border-danger-500/20 dark:bg-gradient-to-br dark:from-danger-500/5 dark:to-navy-900 space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-danger-500/15 text-danger-400">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">PREDICTED RISK STATUS</span>
              <h3 className="text-2xl font-extrabold text-danger-400 mt-1">Pending</h3>
              <p className="text-xs text-gray-500 mt-0.5">Submit form to predict</p>
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
