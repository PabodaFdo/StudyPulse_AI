import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { BarChart3, Clock, Flame, Calendar, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../services/api';

const FocusAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    totalMinutes: 0,
    totalSessions: 0,
    sessions: []
  });
  
  const [weeklyChartData, setWeeklyChartData] = useState([
    { day: 'Mon', minutes: 0 },
    { day: 'Tue', minutes: 0 },
    { day: 'Wed', minutes: 0 },
    { day: 'Thu', minutes: 0 },
    { day: 'Fri', minutes: 0 },
    { day: 'Sat', minutes: 0 },
    { day: 'Sun', minutes: 0 },
  ]);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/focus-sessions/analytics');
      setAnalytics(res.data);
      
      const dayMap = { 0: 'Sun', 1: 'Mon', 2: 'Tue', 3: 'Wed', 4: 'Thu', 5: 'Fri', 6: 'Sat' };
      const weekData = { 'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0 };
      
      res.data.sessions.forEach(session => {
        const date = new Date(session.createdAt);
        const dayStr = dayMap[date.getDay()];
        weekData[dayStr] += session.duration;
      });

      const formattedChart = [
        { day: 'Mon', minutes: weekData['Mon'] },
        { day: 'Tue', minutes: weekData['Tue'] },
        { day: 'Wed', minutes: weekData['Wed'] },
        { day: 'Thu', minutes: weekData['Thu'] },
        { day: 'Fri', minutes: weekData['Fri'] },
        { day: 'Sat', minutes: weekData['Sat'] },
        { day: 'Sun', minutes: weekData['Sun'] },
      ];
      setWeeklyChartData(formattedChart);

    } catch (error) {
      toast.error('Failed to load analytics data.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <PageHeader
        title="Focus Analytics"
        subtitle="Review your study duration trends and focus intensity breakdowns."
        icon={BarChart3}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Clock}
          label="Focus Minutes"
          value={`${analytics.totalMinutes.toLocaleString()} mins`}
          change={8}
          changeType="positive"
          color="purple"
        />
        <StatCard
          icon={Flame}
          label="Active Day Streak"
          value="6 Days"
          change={100}
          changeType="positive"
          color="red"
        />
        <StatCard
          icon={Calendar}
          label="Sessions Completed"
          value={`${analytics.totalSessions.toLocaleString()} Sessions`}
          change={12}
          changeType="positive"
          color="blue"
        />
        <StatCard
          icon={Award}
          label="Productivity Rate"
          value="94%"
          change={2}
          changeType="positive"
          color="green"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recharts BarChart */}
        <ChartCard
          title="Daily Study Minutes"
          subtitle="Total minutes spent in focus mode daily"
          className="lg:col-span-2"
        >
          <div className="h-[250px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#1e293b',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="minutes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Breakdown Panel */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="font-semibold text-white text-base">Session Allocation</h3>
          <div className="space-y-4 pt-2">
            {[
              { label: 'Deep Focus Mode', percentage: analytics.totalMinutes > 0 ? 100 : 0, minutes: analytics.totalMinutes, color: 'text-brand-400' },
              { label: 'Short Breaks', percentage: 0, minutes: 0, color: 'text-accent-400' },
              { label: 'Long Breaks', percentage: 0, minutes: 0, color: 'text-success-400' },
            ].map((item, idx) => (
              <div key={idx} className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-300 font-medium">{item.label}</span>
                  <span className={`font-bold ${item.color}`}>{item.percentage}%</span>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500">
                  <span>{item.minutes} minutes logged</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusAnalytics;
