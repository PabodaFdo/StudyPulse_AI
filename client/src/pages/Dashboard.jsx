import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import {
  Timer, BookOpen, Clock, Flame, LayoutDashboard,
  AlertTriangle, Play, Flower2, RefreshCw, PlusCircle,
  FileText, HelpCircle, Layers, File,
  Target, Brain, ShieldAlert, GraduationCap,
  Smile, Activity, Bell
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
import { getFlashcardReviewSummary } from '../services/flashcardReview.service';
import { getSummaryReviewAnalytics } from '../services/summaryReview.service';
import { riskService } from '../services/risk.service';
import { moodService } from '../services/mood.service';
import { burnoutService } from '../services/burnout.service';
import { revisionService } from '../services/revision.service';
import { flowerService } from '../services/flower.service';

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
      <div className="app-page-bg min-h-screen p-6 space-y-6">
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

  const [flashcardStats, setFlashcardStats] = useState({
    totalReviewAttempts: 0,
    totalReviewedCards: 0,
    averageAccuracy: 0,
    totalNeedReviewCards: 0,
    recentReviewAttempts: [],
  });

  const [summaryReviewStats, setSummaryReviewStats] = useState({
    totalReviews: 0,
    totalTimeSeconds: 0
  });

  const [wellnessData, setWellnessData] = useState({
    moodSummary: null,
    burnoutSummary: null,
    revisionReminders: null,
    flowerCollection: null,
    loading: true
  });

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
      const [summaryData, chartsData, questsData, quizStatsRes, riskSummaryData, flashcardStatsRes, summaryReviewRes] = await Promise.all([
        dashboardService.getSummary(),
        dashboardService.getCharts(),
        questService.getQuests(),
        getQuizAttemptStats().catch(() => ({ data: null })),
        riskService.getRiskSummary().catch(() => null),
        getFlashcardReviewSummary().catch(() => ({ data: null })),
        getSummaryReviewAnalytics().catch(() => ({ data: null }))
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

      if (flashcardStatsRes && (flashcardStatsRes.data || flashcardStatsRes.success)) {
        const stats = flashcardStatsRes.data || flashcardStatsRes;
        setFlashcardStats({
          totalReviewAttempts: stats.totalReviewAttempts || 0,
          totalReviewedCards: stats.totalReviewedCards || 0,
          averageAccuracy: stats.averageAccuracy || 0,
          totalNeedReviewCards: stats.totalNeedReviewCards || 0,
          recentReviewAttempts: stats.recentReviewAttempts || [],
        });
      }

      if (summaryReviewRes && (summaryReviewRes.data || summaryReviewRes.success)) {
        const stats = summaryReviewRes.data || summaryReviewRes;
        setSummaryReviewStats({
          totalReviews: stats.totalReviews || 0,
          totalTimeSeconds: stats.totalTimeSeconds || 0
        });
      }
      
      const [moodRes, burnoutRes, revisionRes, flowerRes] = await Promise.allSettled([
        moodService.getSummary(),
        burnoutService.getSummary(),
        revisionService.getReminders({ status: 'Pending' }),
        flowerService.getCollection()
      ]);

      setWellnessData({
        moodSummary: moodRes.status === 'fulfilled' ? moodRes.value?.data || moodRes.value : null,
        burnoutSummary: burnoutRes.status === 'fulfilled' ? burnoutRes.value?.data || burnoutRes.value : null,
        revisionReminders: revisionRes.status === 'fulfilled' ? revisionRes.value?.data || revisionRes.value : null,
        flowerCollection: flowerRes.status === 'fulfilled' ? flowerRes.value?.data || flowerRes.value : null,
        loading: false
      });
      
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
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <AlertTriangle className="h-12 w-12 text-danger-500" />
        <p className="text-danger-500 font-medium">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  // --- Process Data ---
  const getDayName = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Unknown';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const processFocusHistory = (sessions) => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const data = days.map(day => ({ name: day, mins: 0 }));
    if (sessions && sessions.length > 0) {
      sessions.forEach(session => {
        let dayName = getDayName(session.createdAt);
        const dayItem = data.find(d => d.name === dayName);
        if (dayItem) dayItem.mins += (session.duration || 0);
      });
    }
    return data;
  };

  const processHealthScores = (records) => {
    if (!records || records.length === 0) return [];
    const subjectMap = {};
    records.forEach(r => {
      const subj = r.subject?.name || 'Unknown';
      if (!subjectMap[subj]) subjectMap[subj] = { count: 0, scoreSum: 0 };
      let score = 75;
      if (r.examMark) score = r.examMark;
      else if (r.grade) {
        const g = r.grade.toUpperCase();
        if (g.includes('A')) score = 90;
        else if (g.includes('B')) score = 80;
        else if (g.includes('C')) score = 70;
        else if (g.includes('D')) score = 60;
        else if (g.includes('F')) score = 50;
      }
      subjectMap[subj].scoreSum += score;
      subjectMap[subj].count += 1;
    });
    return Object.keys(subjectMap).map(subj => ({
      name: subj.substring(0, 8),
      fullName: subj,
      score: Math.round(subjectMap[subj].scoreSum / subjectMap[subj].count)
    }));
  };

  const getAcademicRecordsSummary = () => {
    const records = charts?.academicRecords || [];
    if (records.length === 0) return null;
    let totalScore = 0;
    let scoreCount = 0;
    records.forEach(r => {
      if (r.examMark) {
        totalScore += r.examMark;
        scoreCount++;
      } else if (r.grade) {
        const g = r.grade.toUpperCase();
        if (g.includes('A')) totalScore += 90;
        else if (g.includes('B')) totalScore += 80;
        else if (g.includes('C')) totalScore += 70;
        else if (g.includes('D')) totalScore += 60;
        else if (g.includes('F')) totalScore += 50;
        else return;
        scoreCount++;
      }
    });
    const averageScore = scoreCount > 0 ? Math.round(totalScore / scoreCount) : null;
    const latestRecord = records[records.length - 1];
    return {
      total: summary?.academicRecordsCount || records.length,
      average: averageScore,
      latest: latestRecord ? `${latestRecord.subject?.name || 'Unknown'} (${latestRecord.grade || latestRecord.examMark})` : null
    };
  };

  const getRecentActivity = () => {
    let activities = [];
    if (charts?.focusSessions) {
      charts.focusSessions.forEach(s => {
        if (s.createdAt) {
          const d = new Date(s.createdAt);
          if (!isNaN(d.getTime())) {
            activities.push({ type: 'focus', date: d, label: `${s.duration || 0} min focus on ${s.subject?.name || 'Subject'}` });
          }
        }
      });
    }
    if (charts?.academicRecords) {
      charts.academicRecords.forEach(r => {
        if (r.createdAt) {
          const d = new Date(r.createdAt);
          if (!isNaN(d.getTime())) {
            activities.push({ type: 'record', date: d, label: `Recorded ${r.grade || r.examMark} in ${r.subject?.name || 'Subject'}` });
          }
        }
      });
    }
    // Sort descending by date
    activities.sort((a, b) => b.date - a.date);
    return activities.slice(0, 4);
  };

  // Stage logic
  const getGardenStage = (pts) => {
    if (pts === undefined) return { label: `Level ${summary?.gardenLevel || 1} Plant`, image: '/src/assets/characters/plant-buddy.png' };
    if (pts <= 20) return { label: 'Seed', image: '/src/assets/characters/plant-buddy.png' };
    if (pts <= 50) return { label: 'Small Sprout', image: '/src/assets/characters/plant-buddy.png' };
    if (pts <= 100) return { label: 'Growing Plant', image: '/src/assets/characters/plant-buddy.png' };
    if (pts <= 160) return { label: 'Healthy Plant', image: '/src/assets/characters/plant-buddy.png' };
    if (pts <= 230) return { label: 'Flower Buds', image: '/src/assets/characters/plant-buddy.png' };
    return { label: 'Blooming Flowers', image: '/src/assets/characters/plant-buddy.png' };
  };

  const focusHistoryData = processFocusHistory(charts?.focusSessions);
  const healthScoresData = processHealthScores(charts?.academicRecords);
  const academicSummary = getAcademicRecordsSummary();
  const recentActivity = getRecentActivity();
  
  const totalFocusMinutes = charts?.focusSessions?.reduce((acc, s) => acc + s.duration, 0) || 0;
  const totalFocusHours = (totalFocusMinutes / 60).toFixed(1);
  const gardenStage = getGardenStage(summary?.growthPoints);

  // Welcome message logic
  let welcomeMessage = "You are making progress. Keep your study streak alive.";
  if ((summary?.focusSessionsCount || 0) === 0) welcomeMessage = "Start your first focus session today.";
  else if ((summary?.notesCount || 0) === 0) welcomeMessage = "Create your first smart note.";
  else if ((summary?.academicRecordsCount || 0) === 0) welcomeMessage = "Add academic records to unlock subject health insights.";

  const completedQuests = quests.filter(q => q.completed).length;

  return (
    <div className="space-y-6 text-text-main pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          title="Student Portal Dashboard"
          subtitle="Manage focus sessions, note reviews, and cultivate digital plants."
          icon={LayoutDashboard}
        />
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchDashboardData(true)}
          className="flex items-center gap-2"
          disabled={refreshing}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh Dashboard'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column - main activities */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Welcome Card & Quick Actions */}
          <div className="app-panel p-5 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4 relative z-10 w-full">
              <AnimatedCharacter src="/src/assets/characters/study-girl-focus.png" variant="focus" size="sm" className="hidden sm:block shrink-0 w-16 h-16" />
              <div className="flex-1">
                <h2 className="text-lg sm:text-xl font-extrabold text-text-main flex items-center gap-2">
                  Good Morning, Student 🌱
                </h2>
                <p className="text-xs text-text-muted font-bold max-w-sm mb-3">
                  {welcomeMessage}
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => navigate('/focus-timer')} className="gap-1.5 text-xs py-1.5 px-3 rounded-xl" size="sm">
                    <Play className="fill-white h-3 w-3" /> Start Focus
                  </Button>
                  <Button onClick={() => navigate('/smart-notes')} variant="outline" className="gap-1.5 text-xs py-1.5 px-3 rounded-xl" size="sm">
                    <PlusCircle className="h-3 w-3" /> Add Note
                  </Button>
                  <Button onClick={() => navigate('/academic-records')} variant="outline" className="gap-1.5 text-xs py-1.5 px-3 rounded-xl" size="sm">
                    <GraduationCap className="h-3 w-3" /> Log Grade
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Priority Insight: Academic Risk */}
          <div className="app-card p-4 sm:p-5 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className={`shrink-0 flex items-center justify-center w-10 h-10 rounded-full ${riskSummary?.highRiskCount > 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-text-main flex items-center gap-2">
                    Academic Risk Summary
                  </h3>
                  {!riskSummary?.hasData ? (
                    <p className="text-xs font-bold text-text-muted mt-0.5">
                      No risk predictions yet. Run your first risk prediction to see insights here.
                    </p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                      <span className="text-[11px] sm:text-xs font-bold text-text-muted">
                        Latest Risk: <span className={riskSummary.latestItem?.riskLevel === 'High Risk' ? 'text-red-500' : riskSummary.latestItem?.riskLevel === 'Medium Risk' ? 'text-amber-500' : 'text-emerald-500'}>{riskSummary.latestItem?.riskLevel}</span>
                      </span>
                      <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                      <span className="text-[11px] sm:text-xs font-bold text-text-muted">
                        Risk Probability: <span className="text-cyan-500">{Math.round(riskSummary.latestItem?.riskScore || 0)}%</span>
                      </span>
                      {riskSummary.highRiskCount > 0 && (
                        <>
                          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <span className="text-[11px] sm:text-xs font-bold text-red-500">
                            {riskSummary.highRiskCount} High Risk
                          </span>
                        </>
                      )}
                      {riskSummary.needsAttention?.length > 0 && (
                        <>
                          <span className="hidden sm:inline-block w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                          <span className="text-[11px] sm:text-xs font-bold text-amber-500">
                            {riskSummary.needsAttention.length} Needs Attention
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0 w-full sm:w-auto">
                {!riskSummary?.hasData ? (
                  <Button onClick={() => navigate('/risk-prediction')} size="sm" className="w-full sm:w-auto text-xs py-1.5">
                    Go to Risk Prediction
                  </Button>
                ) : (
                  <Button onClick={() => navigate('/risk-timeline')} size="sm" variant="outline" className="w-full sm:w-auto text-xs py-1.5">
                    View Risk Timeline
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            <StatCard
              icon={Clock}
              label="Study Hours"
              value={`${totalFocusHours}`}
              badgeText="This Week"
              changeType="neutral"
              color="green"
              onClick={() => navigate('/focus-timer')}
            />
            <StatCard
              icon={Timer}
              label="Focus Sessions"
              value={`${summary?.focusSessionsCount || 0}`}
              badgeText="Total"
              changeType="neutral"
              color="purple"
              onClick={() => navigate('/focus-analytics')}
            />
            <StatCard
              icon={Target}
              label="Quiz Average"
              value={`${Math.round(quizStats.averageQuizScore)}%`}
              badgeText="All Time"
              changeType="neutral"
              color="blue"
            />
            <StatCard
              icon={Flame}
              label="Total Subjects"
              value={`${summary?.subjectsCount || 0}`}
              badgeText="Enrolled"
              changeType="neutral"
              color="red"
              onClick={() => navigate('/subjects')}
            />
          </div>

          {/* Wellness & Gamification Highlights */}
          <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-700/50">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base sm:text-lg text-text-main flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-500" /> Wellness & Gamification
              </h3>
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              {/* Mood Summary */}
              <div 
                className="app-card p-4 cursor-pointer hover:-translate-y-1 transition-all border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between h-full"
                onClick={() => navigate('/mood-checkin')}
              >
                <div>
                  <h4 className="font-extrabold text-sm text-text-main flex items-center gap-1.5 mb-3">
                    <Smile className="w-4 h-4 text-emerald-500" /> Mood Summary
                  </h4>
                  {wellnessData.loading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                  ) : wellnessData.moodSummary ? (
                    <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                      <p className="flex justify-between"><span>Mood:</span> <span className="font-bold">{wellnessData.moodSummary.averageMood?.toFixed(1) || '-'} / 5</span></p>
                      <p className="flex justify-between"><span>Energy:</span> <span className="font-bold">{wellnessData.moodSummary.averageEnergy?.toFixed(1) || '-'} / 5</span></p>
                      <p className="flex justify-between"><span>Stress:</span> <span className="font-bold">{wellnessData.moodSummary.averageStress?.toFixed(1) || '-'} / 5</span></p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                        {wellnessData.moodSummary?.totalCheckIns ?? 0} check-ins this week
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">No mood data.</p>
                  )}
                </div>
              </div>

              {/* Burnout Risk */}
              <div 
                className="app-card p-4 cursor-pointer hover:-translate-y-1 transition-all border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between h-full"
                onClick={() => navigate('/burnout-warning')}
              >
                <div>
                  <h4 className="font-extrabold text-sm text-text-main flex items-center gap-1.5 mb-3">
                    <Flame className="w-4 h-4 text-orange-500" /> Burnout Risk
                  </h4>
                  {wellnessData.loading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    </div>
                  ) : wellnessData.burnoutSummary ? (
                    <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                      <p className="font-bold text-sm mb-1">
                        {Math.round(wellnessData.burnoutSummary?.burnoutRisk ?? 0)}% {wellnessData.burnoutSummary?.riskLevel || 'Low'} Risk
                      </p>
                      <p className="text-[11px] leading-tight text-slate-600 dark:text-slate-400">
                        {wellnessData.burnoutSummary?.recommendations?.[0] || wellnessData.burnoutSummary?.mainReasons?.[0] || 'Your study and wellness balance looks healthy.'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">No burnout data.</p>
                  )}
                </div>
              </div>

              {/* Revision Reminders */}
              <div 
                className="app-card p-4 cursor-pointer hover:-translate-y-1 transition-all border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between h-full"
                onClick={() => navigate('/revision-reminders')}
              >
                <div>
                  <h4 className="font-extrabold text-sm text-text-main flex items-center gap-1.5 mb-3">
                    <Bell className="w-4 h-4 text-blue-500" /> Revision Reminders
                  </h4>
                  {wellnessData.loading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                    </div>
                  ) : (
                    <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                      <p className="font-bold text-sm mb-1 text-blue-600 dark:text-blue-400">
                        {(wellnessData.revisionReminders && wellnessData.revisionReminders.length) || 0} pending
                      </p>
                      {wellnessData.revisionReminders && wellnessData.revisionReminders.length > 0 ? (
                        <>
                          <p className="truncate" title={wellnessData.revisionReminders[0].title}>Next: {wellnessData.revisionReminders[0].title}</p>
                          <p>Priority: <span className="font-bold">{wellnessData.revisionReminders[0].priority || 'Normal'}</span></p>
                        </>
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 mt-2">All caught up!</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Flower Collection */}
              <div 
                className="app-card p-4 cursor-pointer hover:-translate-y-1 transition-all border border-slate-200 dark:border-slate-700/50 flex flex-col justify-between h-full"
                onClick={() => navigate('/flower-collection')}
              >
                <div>
                  <h4 className="font-extrabold text-sm text-text-main flex items-center gap-1.5 mb-3">
                    <Flower2 className="w-4 h-4 text-pink-500" /> Flower Collection
                  </h4>
                  {wellnessData.loading ? (
                    <div className="animate-pulse space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
                    </div>
                  ) : wellnessData.flowerCollection ? (
                    <div className="text-xs space-y-1.5 text-slate-700 dark:text-slate-300">
                      <p className="font-bold text-sm mb-1 text-pink-600 dark:text-pink-400">
                        {wellnessData.flowerCollection.unlockedCount || 0} / {wellnessData.flowerCollection.totalFlowers || 0} unlocked
                      </p>
                      <p>{Math.round(((wellnessData.flowerCollection?.unlockedCount || 0) / (wellnessData.flowerCollection?.totalFlowers || 1)) * 100)}% complete</p>
                      <p className="truncate mt-2 pt-2 border-t border-slate-100 dark:border-slate-700/50 text-slate-500 dark:text-slate-400">
                        Latest: {wellnessData.flowerCollection?.unlockedFlowers?.length > 0 
                          ? [...wellnessData.flowerCollection.unlockedFlowers].sort((a, b) => new Date(b.unlockedAt) - new Date(a.unlockedAt))[0]?.flowerName 
                          : 'None yet'}
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 dark:text-slate-400">No collection data.</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* My AI Library */}
          <div 
            className="app-card p-5 cursor-pointer hover:-translate-y-1 transition-all" 
            onClick={() => navigate('/ai-library')}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-extrabold text-base sm:text-lg text-text-main flex items-center gap-2">
                <Brain className="h-5 w-5 text-indigo-500" /> My AI Library
              </h3>
              <Button 
                onClick={(e) => { e.stopPropagation(); navigate('/ai-library'); }} 
                size="sm" 
                variant="outline" 
                className="text-xs py-1.5 h-auto"
              >
                Open AI Library
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                <FileText className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">Summaries: {summary?.savedSummariesCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400 border border-fuchsia-500/20">
                <HelpCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">Quizzes: {summary?.savedQuizzesCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                <Layers className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">Flashcards: {summary?.savedFlashcardsCount || 0}</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
                <File className="h-3.5 w-3.5" />
                <span className="text-xs font-bold">PDF Materials: {summary?.studyMaterialsCount || 0}</span>
              </div>
            </div>
          </div>

          {/* Quiz Performance Analytics */}
          <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-700/50">
            <div className="app-panel p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-base sm:text-lg text-text-main flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple" /> Quiz Performance
                </h3>
                <Button onClick={() => navigate('/quiz-generator')} size="sm" variant="outline" className="text-xs py-1.5 h-auto">
                  Go to Quiz Generator
                </Button>
              </div>

              {quizStats.totalAttempts === 0 ? (
                <div className="p-4 bg-purple/5 dark:bg-purple-900/10 rounded-xl border border-purple/20 dark:border-purple/30 text-center">
                  <p className="text-xs font-bold text-purple dark:text-purple-300">
                    No quiz attempts saved yet. Complete a quiz to see analytics here.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-3 sm:gap-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Avg Score</span>
                      <span className="text-lg font-extrabold text-blue-500">{Math.round(quizStats.averageQuizScore)}%</span>
                    </div>
                    <div className="w-px bg-lavender/30 dark:bg-slate-700/50"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Best Score</span>
                      <span className="text-lg font-extrabold text-amber-500">{Math.round(quizStats.bestScore)}%</span>
                    </div>
                    <div className="w-px bg-lavender/30 dark:bg-slate-700/50"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Latest</span>
                      <span className="text-lg font-extrabold text-emerald-500">{Math.round(quizStats.latestScore)}%</span>
                    </div>
                    <div className="w-px bg-lavender/30 dark:bg-slate-700/50"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Attempts</span>
                      <span className="text-lg font-extrabold text-purple">{quizStats.totalAttempts}</span>
                    </div>
                    <div className="w-px bg-lavender/30 dark:bg-slate-700/50"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Wrong</span>
                      <span className="text-lg font-extrabold text-red-500">{quizStats.totalWrongAnswers}</span>
                    </div>
                  </div>

                  {quizStats.recentAttempts && quizStats.recentAttempts.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-lavender/20 dark:border-slate-700/50">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Recent Attempts</h4>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {quizStats.recentAttempts.slice(0, 3).map((attempt, i) => (
                          <div key={attempt.id || i} className="flex justify-between items-center p-2.5 rounded-xl app-soft-card border border-slate-200 dark:border-slate-700/50">
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-xs font-bold text-text-main truncate">{attempt.sourceTitle || 'Quiz Attempt'}</p>
                              <p className="text-[9px] text-text-muted mt-0.5">
                                {new Date(attempt.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end flex-shrink-0">
                              <span className="text-xs font-extrabold text-purple dark:text-cyan-400">{Math.round(attempt.percentage || 0)}%</span>
                              <span className="text-[9px] font-bold text-text-muted">{attempt.score}/{attempt.totalQuestions}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Flashcard Activity */}
          <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-700/50">
            <div className="app-panel p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-base sm:text-lg text-text-main flex items-center gap-2">
                  <Layers className="h-5 w-5 text-amber-500" /> Flashcard Activity
                </h3>
                <Button onClick={() => navigate('/flashcards')} size="sm" variant="outline" className="text-xs py-1.5 h-auto">
                  Go to Flashcards
                </Button>
              </div>

              {flashcardStats.totalReviewAttempts === 0 ? (
                <div className="p-4 bg-amber-500/5 dark:bg-amber-900/10 rounded-xl border border-amber-500/20 dark:border-amber-500/30 text-center">
                  <p className="text-xs font-bold text-amber-600 dark:text-amber-400">
                    No flashcard reviews yet. Generate and review flashcards to see analytics here.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-3 sm:gap-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Attempts</span>
                      <span className="text-lg font-extrabold text-amber-500">{flashcardStats.totalReviewAttempts}</span>
                    </div>
                    <div className="w-px bg-lavender/30 dark:bg-slate-700/50"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Cards Reviewed</span>
                      <span className="text-lg font-extrabold text-blue-500">{flashcardStats.totalReviewedCards}</span>
                    </div>
                    <div className="w-px bg-lavender/30 dark:bg-slate-700/50"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Avg Accuracy</span>
                      <span className="text-lg font-extrabold text-purple">{Math.round(flashcardStats.averageAccuracy)}%</span>
                    </div>
                    <div className="w-px bg-lavender/30 dark:bg-slate-700/50"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Need Review</span>
                      <span className="text-lg font-extrabold text-rose-500">{flashcardStats.totalNeedReviewCards}</span>
                    </div>
                  </div>

                  {flashcardStats.recentReviewAttempts && flashcardStats.recentReviewAttempts.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-lavender/20 dark:border-slate-700/50">
                      <h4 className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-2">Recent Reviews</h4>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {flashcardStats.recentReviewAttempts.map((attempt, i) => (
                          <div key={attempt.id || i} className="flex justify-between items-center p-2.5 rounded-xl app-soft-card border border-slate-200 dark:border-slate-700/50">
                            <div className="min-w-0 flex-1 pr-2">
                              <p className="text-xs font-bold text-text-main truncate">{attempt.sourceTitle || 'Flashcard Deck'}</p>
                              <p className="text-[9px] text-text-muted mt-0.5">
                                {new Date(attempt.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex flex-col items-end flex-shrink-0">
                              <span className="text-xs font-extrabold text-amber-500">{Math.round(attempt.accuracy || 0)}%</span>
                              <span className="text-[9px] font-bold text-text-muted">{attempt.reviewedCards} cards</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Summary Activity */}
          <div className="pt-4 pb-2 border-t border-slate-200 dark:border-slate-700/50">
            <div className="app-panel p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-base sm:text-lg text-text-main flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-500" /> Summary Activity
                </h3>
                <Button onClick={() => navigate('/library?tab=summaries')} size="sm" variant="outline" className="text-xs py-1.5 h-auto">
                  Go to AI Library
                </Button>
              </div>

              {summaryReviewStats.totalReviews === 0 ? (
                <div className="p-4 bg-emerald-500/5 dark:bg-emerald-900/10 rounded-xl border border-emerald-500/20 dark:border-emerald-500/30 text-center">
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    No summary reviews yet. Generate and review summaries to see analytics here.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="flex flex-wrap gap-3 sm:gap-5">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Summaries Reviewed</span>
                      <span className="text-lg font-extrabold text-emerald-500">{summaryReviewStats.totalReviews}</span>
                    </div>
                    <div className="w-px bg-lavender/30 dark:bg-slate-700/50"></div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-text-muted uppercase">Total Review Time</span>
                      <span className="text-lg font-extrabold text-blue-500">
                        {summaryReviewStats.totalTimeSeconds > 0 && summaryReviewStats.totalTimeSeconds < 60 
                          ? '< 1 min' 
                          : `${Math.round(summaryReviewStats.totalTimeSeconds / 60)} min`}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Weekly Focus Chart */}
          <ChartCard
            title="Focus Overview"
            subtitle="Minutes spent focusing in study intervals"
            headerAction={
              <div className="flex app-soft-card rounded-lg p-1 border border-slate-200 dark:border-slate-700/50">
                <button 
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${chartTab === 'week' ? 'bg-white dark:bg-slate-700 shadow-sm text-text-main dark:text-white' : 'text-text-muted hover:text-text-main'}`}
                  onClick={() => setChartTab('week')}
                >
                  Week
                </button>
                <button 
                  className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${chartTab === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm text-text-main dark:text-white' : 'text-text-muted hover:text-text-main'}`}
                  title="Monthly analytics coming soon"
                  disabled
                >
                  Month
                </button>
              </div>
            }
          >
            <div className="h-[220px] w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={focusHistoryData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.08)" />
                  <XAxis dataKey="name" stroke="#6b6388" fontSize={11} tickLine={false} />
                  <YAxis stroke="#6b6388" fontSize={11} tickLine={false} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      borderColor: '#e2e8f0',
                      borderRadius: '12px',
                      color: '#1e293b',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                    itemStyle={{ color: '#8b5cf6' }}
                    wrapperClassName="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-200"
                  />
                  <Area type="monotone" dataKey="mins" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorFocus)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>



        </div>

        {/* Right column - sidebar cards */}
        <div className="space-y-6">
          {/* Study Garden progress with Plant Buddy */}
          <div className="app-panel p-5">
            <div className="liquid-card-content space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm sm:text-base text-text-main flex items-center gap-1.5">
                  <Flower2 className="h-4.5 w-4.5 text-purple" /> Study Garden
                </h3>
                <span className="status-badge status-success">Level {summary?.gardenLevel || 1}</span>
              </div>
              
              <div className="p-3 app-soft-card rounded-2xl border border-slate-200 dark:border-slate-700/50 flex items-center gap-3">
                <AnimatedCharacter
                  src={gardenStage.image}
                  variant="plant"
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-text-main truncate">Mint Lace Fern</p>
                  <p className="text-[10px] text-text-muted">
                    {summary?.growthPoints !== undefined ? `${summary.growthPoints} Growth Points` : ''} - {gardenStage.label}
                  </p>
                </div>
              </div>
              
              {summary?.gardenProgress !== undefined && (
                <ProgressBar value={summary.gardenProgress} color="green" label="Growth Progress" />
              )}
              {summary?.gardenProgress === undefined && summary?.growthPoints !== undefined && summary?.nextLevelPoints !== undefined && (
                <ProgressBar value={Math.round((summary.growthPoints / summary.nextLevelPoints) * 100)} color="green" label="Growth Progress" />
              )}
              <button onClick={() => navigate('/study-garden')} className="w-full mt-3 rounded-xl px-3 py-2 text-xs font-extrabold transition liquid-button">
                Manage Garden →
              </button>
            </div>
          </div>

          {/* Today's Study Quests with Quest Mascot */}
          <div className="app-panel p-5 relative overflow-hidden">
            <div className="liquid-card-content space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-sm sm:text-base text-text-main">Suggested Quests</h3>
                  <p className="text-[10px] font-bold text-text-muted">{completedQuests} / {quests.length} completed</p>
                </div>
                <AnimatedCharacter
                  src="/src/assets/characters/study-girl-quest.png"
                  variant="quest"
                  size="sm"
                  className="w-10 h-10"
                />
              </div>
              
              <div className="space-y-2 text-xs relative z-10">
                {quests.map((q) => {
                  let btnText = "Active";
                  let btnStyle = "app-soft-card border-slate-200 dark:border-slate-700/50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700";
                  let iconColor = "text-text-muted/40";
                  let icon = "○";
                  let isClaimable = false;
                  
                  if (q.completed) {
                    btnText = "Claimed";
                    btnStyle = "bg-slate-50/50 dark:bg-slate-800/30 border-slate-200 dark:border-slate-700/50 cursor-default";
                    iconColor = "text-green-500";
                    icon = "●";
                  } else if (q.targetReached) {
                    btnText = "Claim Reward";
                    btnStyle = "bg-purple/10 dark:bg-purple/20 border-purple/30 cursor-pointer hover:bg-purple/20 shadow-sm";
                    iconColor = "text-purple";
                    icon = "⭐";
                    isClaimable = true;
                  }

                  return (
                  <button 
                    key={q.id} 
                    onClick={async () => {
                      if (q.completed || questLoadingId) return;
                      
                      if (!q.targetReached) {
                        if (q.title.toLowerCase().includes('focus')) navigate('/focus-timer');
                        else if (q.title.toLowerCase().includes('note')) navigate('/smart-notes');
                        else if (q.title.toLowerCase().includes('academic')) navigate('/academic-records');
                        return;
                      }

                      try {
                        setQuestLoadingId(q.id);
                        await questService.completeQuest(q.id);
                        // Refetch dashboard data completely to update growth points and quest status
                        await fetchDashboardData(true);
                      } catch (err) {
                        console.error('Error completing quest:', err);
                      } finally {
                        setQuestLoadingId(null);
                      }
                    }}
                    disabled={q.completed || questLoadingId === q.id}
                    className={`w-full text-left flex items-center justify-between p-2.5 rounded-xl transition-all ${btnStyle} border`}
                  >
                    <div className="flex items-center gap-2 max-w-[75%]">
                      <span className={`text-base flex-shrink-0 ${iconColor}`}>
                        {questLoadingId === q.id ? <RefreshCw className="h-4 w-4 animate-spin text-purple" /> : icon}
                      </span>
                      <div className="flex flex-col min-w-0">
                        <span className={`font-semibold transition-all truncate ${q.completed ? 'text-text-muted line-through opacity-70' : 'text-text-main dark:text-slate-200'}`}>
                          {q.title}
                        </span>
                        {q.description && (
                          <span className={`text-[10px] truncate ${q.completed ? 'text-text-muted/50' : 'text-text-muted'}`}>
                            {q.description}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 gap-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${q.completed ? 'bg-green-500/10 text-green-500' : 'bg-purple/10 text-purple'}`}>
                        +{q.rewardPoints} pts
                      </span>
                      {q.completed ? (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md border bg-green-100 text-green-700 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-400/30">{btnText}</span>
                      ) : isClaimable ? (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md border shadow-sm bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-500/20 dark:text-purple-100 dark:border-purple-400/40">{btnText}</span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-md border bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-700/50 dark:text-slate-200 dark:border-slate-600/50">{btnText}</span>
                      )}
                    </div>
                  </button>
                )})}
              </div>
            </div>
          </div>

          {/* Academic Records Summary */}
          <div className="app-panel p-5">
            <div className="liquid-card-content space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-extrabold text-sm sm:text-base text-text-main flex items-center gap-1.5">
                  <BookOpen className="h-4.5 w-4.5 text-purple" /> Academic Records
                </h3>
                <span className="status-badge status-success bg-blue/10 text-blue border border-blue/20 dark:bg-blue/20 dark:text-blue-400">
                  {academicSummary ? academicSummary.total : 0} Saved
                </span>
              </div>
              
              {academicSummary ? (
                <div className="space-y-2">
                  {academicSummary.average !== null && (
                    <div className="flex justify-between items-center text-xs p-2.5 rounded-xl app-soft-card border border-slate-200 dark:border-slate-700/50">
                      <span className="font-bold text-text-main dark:text-slate-200">Average Score</span>
                      <span className="font-bold text-purple dark:text-cyan-400">{academicSummary.average}%</span>
                    </div>
                  )}
                  {academicSummary.latest && (
                    <div className="flex justify-between items-center text-xs p-2.5 rounded-xl app-soft-card border border-slate-200 dark:border-slate-700/50">
                      <span className="font-bold text-text-main dark:text-slate-200">Latest Record</span>
                      <span className="font-bold text-text-muted dark:text-slate-400 truncate max-w-[120px]" title={academicSummary.latest}>
                        {academicSummary.latest}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 text-center rounded-xl app-soft-card border border-slate-200 dark:border-slate-700/50">
                  <p className="text-xs font-bold text-text-muted">No academic records yet. Add your first record to unlock insights.</p>
                </div>
              )}
              
              <button onClick={() => navigate('/academic-records')} className="w-full mt-3 rounded-xl px-3 py-2 text-xs font-extrabold transition liquid-button">
                View Academic Records →
              </button>
            </div>
          </div>

          {/* Subject Health Chart */}
          <ChartCard title="Subject Health" className="p-4 sm:p-5">
            <div className="h-[150px] w-full mt-2">
              {healthScoresData && healthScoresData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={healthScoresData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139,92,246,0.05)" />
                    <XAxis dataKey="name" stroke="#6b6388" fontSize={10} tickLine={false} />
                    <YAxis stroke="#6b6388" fontSize={10} tickLine={false} />
                    <RechartsTooltip
                      cursor={{fill: 'rgba(139,92,246,0.1)'}}
                      contentStyle={{
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        borderColor: '#e2e8f0',
                        borderRadius: '12px',
                        color: '#1e293b',
                        fontSize: '11px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                      itemStyle={{ color: '#ffb6d5' }}
                      wrapperClassName="dark:!bg-slate-800 dark:!border-slate-700 dark:!text-slate-200"
                      formatter={(value, name, props) => [value + '%', props.payload.fullName || name]}
                    />
                    <Bar 
                      dataKey="score" 
                      fill="#ffb6d5" 
                      radius={[4, 4, 0, 0]} 
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={() => navigate('/academic-records')}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-center px-4">
                  <p className="text-xs font-bold text-text-muted">No academic records available yet.</p>
                </div>
              )}
            </div>
          </ChartCard>

          {/* Recent Activity Timeline */}
          <div className="app-panel p-5">
            <h3 className="font-extrabold text-sm sm:text-base text-text-main mb-4 flex items-center gap-1.5">
              <Clock className="h-4.5 w-4.5 text-purple" /> Recent Activity
            </h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                <div className="relative border-l-2 border-lavender/30 dark:border-slate-700 ml-3 space-y-5">
                  {recentActivity.map((activity, i) => (
                    <div key={i} className="relative pl-6">
                      <div className={`absolute -left-[9px] top-1 h-4 w-4 rounded-full border-2 border-white dark:border-slate-900 ${activity.type === 'focus' ? 'bg-purple' : 'bg-blue'}`}></div>
                      <p className="text-xs font-bold text-text-main dark:text-slate-200">{activity.label}</p>
                      <p className="text-[10px] font-semibold text-text-muted mt-0.5">{activity.date.toLocaleDateString()} at {activity.date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-6 app-soft-card rounded-xl border border-slate-200 dark:border-slate-700/50">
                  <p className="text-xs font-bold text-text-muted">No recent activity yet.</p>
                  <button onClick={() => navigate('/focus-timer')} className="text-purple hover:underline text-xs font-bold mt-2 inline-block">
                    Start a focus session
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;
