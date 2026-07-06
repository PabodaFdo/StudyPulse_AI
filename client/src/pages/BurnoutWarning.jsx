import { useState, useEffect } from 'react';
import { Flame, ShieldAlert, Heart, Activity, Zap, Smile } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import ProgressBar from '../components/ProgressBar';
import { burnoutService } from '../services/burnout.service';

const BurnoutWarning = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await burnoutService.getSummary();
      setSummary(data.data || data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load burnout summary');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!summary || (summary.recentMoodCheckIns === 0 && summary.weeklyFocusSessions === 0)) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Burnout Warning"
          subtitle="Understand stress triggers analyzed from your activity logs."
          icon={Flame}
        />
        <div className="glass-card p-8 border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            Not enough data yet. Complete Mood Check-ins and Focus Sessions to improve burnout analysis.
          </p>
        </div>
      </div>
    );
  }

  const getRiskColor = (level) => {
    if (level === 'High') return 'red';
    if (level === 'Medium') return 'yellow';
    return 'green';
  };

  const getRiskClasses = (level) => {
    if (level === 'High') return 'border-red-500/20 bg-gradient-to-br from-red-500/5 to-slate-100 dark:to-navy-900 text-red-500 dark:text-red-400';
    if (level === 'Medium') return 'border-yellow-500/20 bg-gradient-to-br from-yellow-500/5 to-slate-100 dark:to-navy-900 text-yellow-600 dark:text-yellow-400';
    return 'border-green-500/20 bg-gradient-to-br from-green-500/5 to-slate-100 dark:to-navy-900 text-green-600 dark:text-green-400';
  };

  const getIconBgClass = (level) => {
    if (level === 'High') return 'bg-red-500/15 text-red-500 dark:text-red-400';
    if (level === 'Medium') return 'bg-yellow-500/15 text-yellow-600 dark:text-yellow-400';
    return 'bg-green-500/15 text-green-600 dark:text-green-400';
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Burnout Warning"
        subtitle="Understand stress triggers analyzed from your activity logs."
        icon={Flame}
      />

      {(() => {
        const mainReasons = summary?.mainReasons || [];
        const recommendations = summary?.recommendations || [];
        const riskLevel = summary?.riskLevel || 'Low';
        const burnoutRisk = summary?.burnoutRisk ?? 0;
        const generatedAt = summary?.generatedAt || new Date().toISOString();
        const weeklyFocusHours = summary?.weeklyFocusHours ?? 0;
        const weeklyFocusSessions = summary?.weeklyFocusSessions ?? 0;
        const averageStress = summary?.averageStress ?? 0;
        const averageEnergy = summary?.averageEnergy ?? 0;
        const averageMood = summary?.averageMood ?? 0;

        return (
          <>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Burnout Score */}
              <div className={`glass-card p-6 border text-center space-y-4 ${getRiskClasses(riskLevel)}`}>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${getIconBgClass(riskLevel)}`}>
                  {riskLevel === 'High' ? (
                    <ShieldAlert className="h-6 w-6 animate-pulse" />
                  ) : (
                    <Flame className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase tracking-wider block">BURNOUT RISK STATUS</span>
                  <h3 className="text-2xl font-extrabold mt-1">{riskLevel} Risk ({burnoutRisk}%)</h3>
                  <p className="text-xs text-slate-500 dark:text-gray-500 mt-0.5">Calculated: {new Date(generatedAt).toLocaleString()}</p>
                </div>
                <div className="pt-2">
                  <ProgressBar value={burnoutRisk} color={getRiskColor(riskLevel)} label="Risk Index" />
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="lg:col-span-2 glass-card p-6 border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 space-y-4">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Key Indicators (Last 7 Days)</h3>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase block">Weekly Focus</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{weeklyFocusHours} Hours</p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400">{weeklyFocusSessions} sessions</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase block flex items-center gap-1"><Activity className="w-3 h-3"/> Avg Stress</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{averageStress}/5</p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400">{summary?.recentMoodCheckIns ?? 0} check-ins</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase block flex items-center gap-1"><Zap className="w-3 h-3"/> Avg Energy</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{averageEnergy}/5</p>
                  </div>
                  <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5 space-y-2">
                    <span className="text-[10px] text-slate-500 dark:text-gray-400 font-bold uppercase block flex items-center gap-1"><Smile className="w-3 h-3"/> Avg Mood</span>
                    <p className="text-lg font-bold text-slate-900 dark:text-white">{averageMood}/5</p>
                    <p className="text-[10px] text-slate-500 dark:text-gray-400">mood check-in average</p>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-semibold text-sm text-slate-800 dark:text-gray-200 mb-2">Main Reasons</h4>
                  <ul className="list-disc pl-5 text-sm text-slate-600 dark:text-gray-400 space-y-1">
                    {mainReasons.length > 0 ? (
                      mainReasons.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))
                    ) : (
                      <p>No major burnout reasons detected yet.</p>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Strategies */}
            <div className="glass-card p-5 border border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-900/70 space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Heart className="h-4.5 w-4.5 text-red-500 dark:text-danger-400" /> Suggested Rebalancing Steps
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 space-y-2">
                      <p className="text-slate-700 dark:text-gray-300 text-sm leading-relaxed">{rec}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-slate-500 dark:text-slate-400">Complete more Mood Check-ins and Focus Sessions to improve recommendations.</p>
                )}
              </div>
            </div>
          </>
        );
      })()}
    </div>
  );
};

export default BurnoutWarning;
