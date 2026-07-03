import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
  Timer, BookOpen, Clock, Flame, LayoutDashboard,
  AlertTriangle, Play, Flower2, RefreshCw, PlusCircle,
  FileText, HelpCircle, Layers, File,
  BarChart3, Trophy, Target, TrendingUp, Brain, ShieldAlert, HeartPulse, Activity, GraduationCap, ChevronRight
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import ProgressBar from '../components/ProgressBar';
import Button from '../components/Button';
import AnimatedCharacter from '../components/AnimatedCharacter';
import dashboardService from '../services/dashboard.service';
import questService from '../services/quest.service';
import { getQuizAttemptStats } from '../services/quizAttempt.service';
import { riskService } from '../services/risk.service';

// Skeleton Component
const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <div className="h-40 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
        <div className="grid gap-4 sm:grid-cols-4">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
        </div>
        <div className="h-72 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
      <div className="space-y-6">
        {[1,2,3,4].map(i => <div key={i} className="h-48 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>)}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [summary, setSummary] = useState(null);
  const [charts, setCharts] = useState(null);
  const [riskSummary, setRiskSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [chartTab, setChartTab] = useState('week');

  const [quests, setQuests] = useState([]);
  const [questLoadingId, setQuestLoadingId] = useState(null);

  const [quizStats, setQuizStats] = useState({
    totalAttempts: 0,
    averageQuizScore: 0,
    totalWrongAnswers: 0,
    bestScore: 0,
    latestScore: 0,
    recentAttempts: [],
  });

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const [summaryData, chartsData, questsData, quizStatsRes, riskSummaryData] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getCharts(),
        questService.getQuests(),
        getQuizAttemptStats().catch(() => ({ data: null })),
        riskService.getRiskSummary().catch(() => null)
      ]);
      setSummary(summaryData);
      setCharts(chartsData);
      setQuests(questsData);
      setRiskSummary(riskSummaryData);
      
      if (quizStatsRes && (quizStatsRes.data || quizStatsRes.success)) {
        const stats = quizStatsRes.data || quizStatsRes;
        setQuizStats({
          totalAttempts: stats.totalAttempts || 0,
          averageQuizScore: stats.averageQuizScore || 0,
          totalWrongAnswers: stats.totalWrongAnswers || 0,
          bestScore: stats.bestScore || 0,
          latestScore: stats.latestScore || 0,
          recentAttempts: stats.recentAttempts || [],
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
  return null;
};
export default Dashboard;
