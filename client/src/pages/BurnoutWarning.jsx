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
        <div className="app-card p-8 text-center">
          <p className="card-muted">
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
              <div className={`app-card p-6 border text-center space-y-4 ${getRiskClasses(riskLevel)}`}>
                <div className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ${getIconBgClass(riskLevel)}`}>
                  {riskLevel === 'High' ? (
                    <ShieldAlert className="h-6 w-6 animate-pulse" />
                  ) : (
                    <Flame className="h-6 w-6" />
                  )}
                </div>
                <div>
                  <span className="text-[10px] card-muted font-bold uppercase tracking-wider block">BURNOUT RISK STATUS</span>
                  <h3 className="text-2xl font-extrabold mt-1">{riskLevel} Risk ({burnoutRisk}%)</h3>
                  <p className="text-xs card-muted mt-0.5">Calculated: {new Date(generatedAt).toLocaleString()}</p>
                </div>
                <div className="pt-2">
                  <ProgressBar value={burnoutRisk} color={getRiskColor(riskLevel)} label="Risk Index" />
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="lg:col-span-2 app-panel p-6 space-y-4">
                <h3 className="font-bold card-title text-base">Key Indicators (Last 7 Days)</h3>
                
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="app-soft-card p-4 rounded-xl space-y-2">
                    <span className="text-[10px] card-muted font-bold uppercase block">Weekly Focus</span>
                    <p className="text-lg font-bold card-title">{weeklyFocusHours} Hours</p>
                    <p className="text-[10px] card-muted">{weeklyFocusSessions} sessions</p>
                  </div>
                  <div className="app-soft-card p-4 rounded-xl space-y-2">
                    <span className="text-[10px] card-muted font-bold uppercase block flex items-center gap-1"><Activity className="w-3 h-3"/> Avg Stress</span>
                    <p className="text-lg font-bold card-title">{averageStress}/5</p>
                    <p className="text-[10px] card-muted">{summary?.recentMoodCheckIns ?? 0} check-ins</p>
                  </div>
                  <div className="app-soft-card p-4 rounded-xl space-y-2">
                    <span className="text-[10px] card-muted font-bold uppercase block flex items-center gap-1"><Zap className="w-3 h-3"/> Avg Energy</span>
                    <p className="text-lg font-bold card-title">{averageEnergy}/5</p>
                  </div>
                  <div className="app-soft-card p-4 rounded-xl space-y-2">
                    <span className="text-[10px] card-muted font-bold uppercase block flex items-center gap-1"><Smile className="w-3 h-3"/> Avg Mood</span>
                    <p className="text-lg font-bold card-title">{averageMood}/5</p>
                    <p className="text-[10px] card-muted">mood check-in average</p>
                  </div>
                </div>

                <div className="pt-2">
                  <h4 className="font-semibold text-sm card-title mb-2">Main Reasons</h4>
                  <ul className="list-disc pl-5 text-sm card-muted space-y-1">
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
            <div className="app-panel p-5 space-y-4">
              <h3 className="font-bold card-title text-base flex items-center gap-2">
                <Heart className="h-4.5 w-4.5 text-red-500 dark:text-danger-400" /> Suggested Rebalancing Steps
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                {recommendations.length > 0 ? (
                  recommendations.map((rec, i) => (
                    <div key={i} className="p-4 rounded-xl app-soft-card space-y-2">
                      <p className="app-readable-text text-sm leading-relaxed">{rec}</p>
                    </div>
                  ))
                ) : (
                  <p className="card-muted">Complete more Mood Check-ins and Focus Sessions to improve recommendations.</p>
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
