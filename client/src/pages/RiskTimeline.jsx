import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, TrendingDown, TrendingUp, Activity, ShieldAlert, Calendar, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import ChartCard from '../components/ChartCard';
import { riskService } from '../services/risk.service';
import { subjectService } from '../services/subject.service';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-800 border border-slate-700 p-3 rounded-lg shadow-lg text-white text-xs space-y-1 z-50 relative">
        <p className="font-bold text-slate-300 mb-2">{data.fullDateTimeLabel}</p>
        <p><span className="text-slate-400">Risk Level:</span> <span className="font-semibold">{data.riskLevel}</span></p>
        <p><span className="text-slate-400">Risk Probability:</span> <span className="font-semibold">{data.riskProbability}%</span></p>
        <p><span className="text-slate-400">Trend:</span> <span className="font-semibold">{data.trend}</span></p>
      </div>
    );
  }
  return null;
};

const RiskTimeline = () => {
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [riskHistory, setRiskHistory] = useState([]);
  const [loading, setLoading] = useState(false);

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
      setLoading(true);
      const fetchHistory = async () => {
        try {
          const history = await riskService.getRiskHistory(selectedSubjectId);
          setRiskHistory(history);
        } catch (err) {
          console.error("Failed to fetch risk history", err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    } else {
      setRiskHistory([]);
    }
  }, [selectedSubjectId]);

  const chartData = [...riskHistory].reverse().map((item, index) => {
    const d = new Date(item.createdAt);
    const fullDateTimeLabel = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) + ' ' + 
                              d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return {
      id: item.id,
      dateLabel: `Prediction ${index + 1}`,
      fullDateTimeLabel: fullDateTimeLabel,
      riskProbability: Math.round(item.riskScore),
      riskLevel: item.riskLevel,
      trend: item.trend,
      trendMessage: item.trendMessage,
      createdAt: item.createdAt
    };
  });

  const latestPrediction = riskHistory.length > 0 ? riskHistory[0] : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Risk Timeline"
        subtitle="Review how your academic risk probability has changed over time. Higher Risk Probability (%) indicates greater academic risk."
        icon={Clock}
      />

      <div className="bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 text-slate-800 dark:text-white shadow-sm p-6 rounded-2xl space-y-4">
        <div className="max-w-md">
          <label className="block text-sm text-slate-700 dark:text-slate-200 mb-2">Select Subject to View Timeline</label>
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className="w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:border-cyan-400 text-slate-800 dark:text-white placeholder-slate-400"
          >
            <option value="">Select a subject...</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name || subject.subjectName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedSubjectId ? (
        <div className="p-10 text-center bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
          <Calendar className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto mb-3 opacity-50" />
          <p className="text-slate-500 dark:text-slate-400 text-sm">Please select a subject to view its risk timeline.</p>
        </div>
      ) : loading ? (
        <div className="p-10 text-center bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
          <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-3"></div>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Loading history...</p>
        </div>
      ) : riskHistory.length === 0 ? (
        <div className="p-10 text-center bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/50 rounded-2xl shadow-sm">
          <ShieldAlert className="w-12 h-12 text-violet-400 dark:text-violet-400/70 mx-auto mb-3 opacity-80" />
          <p className="text-slate-700 dark:text-slate-300 font-medium mb-2">No risk history found for this subject yet.</p>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">Go to Risk Prediction and run your first prediction.</p>
          <Link 
            to="/risk-prediction" 
            className="inline-flex items-center px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all shadow-lg shadow-purple-500/20"
          >
            Go to Risk Prediction
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Latest Risk Level</span>
              <span className={`text-lg font-extrabold ${
                latestPrediction?.riskLevel === 'High Risk' ? 'text-red-500' :
                latestPrediction?.riskLevel === 'Medium Risk' ? 'text-amber-500' :
                'text-emerald-500'
              }`}>
                {latestPrediction?.riskLevel}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Risk Probability</span>
              <span className="text-lg font-extrabold text-cyan-500">{Math.round(latestPrediction?.riskScore || 0)}%</span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Latest Trend</span>
              <span className={`text-sm font-bold px-2 py-1 rounded-md mt-1 ${
                latestPrediction?.trend === 'Improving' ? 'bg-emerald-500/20 text-emerald-400' :
                latestPrediction?.trend === 'Declining' ? 'bg-red-500/20 text-red-400' :
                latestPrediction?.trend === 'Stable' ? 'bg-cyan-500/20 text-cyan-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {latestPrediction?.trend}
              </span>
            </div>
            <div className="bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider mb-1">Total Predictions</span>
              <span className="text-lg font-extrabold text-purple-400">{riskHistory.length}</span>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <ChartCard
              title="Historical Risk Probability Trend"
              subtitle="Higher Risk Probability (%) indicates greater academic risk."
              className="lg:col-span-2"
            >
              <div className="h-[250px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="dateLabel" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={11} 
                      tickLine={false} 
                      domain={[0, 100]} 
                      ticks={[0, 25, 50, 75, 100]}
                      tickFormatter={(val) => `${val}%`}
                      width={45}
                      label={{ 
                        value: 'Risk Probability (%)', 
                        angle: -90, 
                        position: 'insideLeft',
                        offset: -5,
                        style: { textAnchor: 'middle', fill: '#64748b', fontSize: 11, fontWeight: 'bold' } 
                      }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="riskProbability" 
                      name="Risk Probability" 
                      stroke="#8b5cf6" 
                      strokeWidth={3} 
                      activeDot={{ r: 6, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }} 
                      dot={{ r: 4, fill: '#1e293b', stroke: '#8b5cf6', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            <div className="bg-white/80 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 p-5 rounded-2xl shadow-sm backdrop-blur-xl flex flex-col">
              <h3 className="font-semibold text-slate-900 dark:text-white text-base mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-500" /> Timeline Events
              </h3>
              <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 flex-1">
                {riskHistory.map((evt) => {
                  const subjectName = subjects.find(s => String(s.id) === String(evt.subjectId))?.name || 'Subject';
                  
                  let title;
                  let icon;
                  let borderColorClass;
                  let iconBgClass;

                  if (evt.trend === 'Improving') {
                    title = `${subjectName} improved to ${evt.riskLevel} with a ${Math.round(evt.riskScore)}% risk probability.`;
                    icon = <TrendingUp className="w-3.5 h-3.5" />;
                    borderColorClass = 'border-emerald-200 dark:border-emerald-500/20';
                    iconBgClass = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400';
                  } else if (evt.trend === 'Declining') {
                    title = `${subjectName} declined to ${evt.riskLevel} with a ${Math.round(evt.riskScore)}% risk probability.`;
                    icon = <TrendingDown className="w-3.5 h-3.5" />;
                    borderColorClass = 'border-red-200 dark:border-red-500/20';
                    iconBgClass = 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400';
                  } else if (evt.trend === 'Stable') {
                    title = `${subjectName} remained stable compared with the previous prediction.`;
                    icon = <Activity className="w-3.5 h-3.5" />;
                    borderColorClass = 'border-cyan-200 dark:border-cyan-500/20';
                    iconBgClass = 'bg-cyan-100 text-cyan-600 dark:bg-cyan-500/20 dark:text-cyan-400';
                  } else {
                    title = `First prediction saved for ${subjectName}.`;
                    icon = <CheckCircle className="w-3.5 h-3.5" />;
                    borderColorClass = 'border-purple-200 dark:border-purple-500/20';
                    iconBgClass = 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400';
                  }

                  return (
                    <div key={evt.id} className={`p-3 bg-white dark:bg-slate-800/40 border ${borderColorClass} rounded-xl space-y-1`}>
                      <div className="flex gap-3 items-start">
                        <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${iconBgClass}`}>
                          {icon}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start text-xs">
                            <span className="font-bold text-slate-700 dark:text-gray-200 leading-snug pr-2">{title}</span>
                            <span className="text-[10px] text-slate-500 whitespace-nowrap shrink-0">{new Date(evt.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <p className="text-[10px] text-slate-500 dark:text-gray-400 leading-relaxed">{evt.trendMessage}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RiskTimeline;
