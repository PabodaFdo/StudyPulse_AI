import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import AnimatedCharacter from '../components/AnimatedCharacter';
import questService from '../services/quest.service';

const StudyQuests = () => {
  const navigate = useNavigate();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [questLoadingId, setQuestLoadingId] = useState(null);

  const fetchQuests = async () => {
    try {
      setLoading(true);
      const data = await questService.getQuests();
      setQuests(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching quests:', err);
      setError('Failed to load quests. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuests();
  }, []);

  const handleQuestClick = async (q) => {
    if (q.completed || questLoadingId) return;

    if (!q.targetReached) {
      if (q.title.toLowerCase().includes('focus')) navigate('/focus-timer');
      else if (q.title.toLowerCase().includes('note') || q.title.toLowerCase().includes('synthesis') || q.title.toLowerCase().includes('folder')) navigate('/smart-notes');
      else if (q.title.toLowerCase().includes('academic')) navigate('/academic-records');
      else toast('Coming Soon', { icon: '⏳' });
      return;
    }

    try {
      setQuestLoadingId(q.id);
      await questService.completeQuest(q.id);
      toast.success(`Quest Claimed! +${q.rewardPoints} GP`);
      await fetchQuests();
    } catch (err) {
      console.error('Error claiming quest:', err);
      toast.error('Failed to claim reward');
    } finally {
      setQuestLoadingId(null);
    }
  };

  if (loading && quests.length === 0) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-20 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-2xl"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center space-y-4">
        <p className="text-danger-500 font-medium">{error}</p>
        <Button onClick={fetchQuests}>Retry</Button>
      </div>
    );
  }

  const dailyQuests = quests.filter(q => q.type === 'DAILY');
  const weeklyQuests = quests.filter(q => q.type === 'WEEKLY');

  return (
    <div className="space-y-6 text-text-main relative">
      <PageHeader
        title="Study Quests"
        subtitle="Complete daily and weekly verified quests to earn items for your Study Garden."
        icon={Swords}
      />

      {/* Top Banner with Mascot */}
      <div className="app-panel p-6 bg-gradient-to-r from-purple/10 to-pink/5 mb-6">
        <div className="liquid-card-content flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-base font-extrabold text-text-main">Complete today's quests to help your Study Garden bloom</h3>
            <p className="text-xs text-text-muted font-bold">
              Each logged achievement allocates fertilizer or rare seeds to nurture your flowers.
            </p>
          </div>
          <div className="flex-shrink-0">
            <AnimatedCharacter
              src="/src/assets/characters/study-girl-quest.png"
              variant="quest"
              size="md"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Daily Quests */}
        <div className="app-panel p-5">
          <div className="liquid-card-content space-y-4">
            <div className="flex justify-between items-center border-b border-lavender/10 pb-2">
              <h3 className="font-extrabold text-sm sm:text-base text-text-main">Daily Missions</h3>
              <Badge color="purple">Reset: 24h</Badge>
            </div>

            <div className="space-y-3">
              {dailyQuests.map((q) => {
                let btnText = "Active";
                let btnStyle = "bg-white dark:bg-slate-900/80 border-lavender/10 dark:border-white/10 hover:bg-cream dark:hover:bg-slate-800 cursor-pointer";
                let badgeClass = "bg-slate-700/80 text-white border border-slate-500/40 dark:bg-slate-700 dark:text-slate-100";
                let icon = "○";
                let titleStyle = "text-text-main";

                if (q.completed) {
                  btnText = "Claimed";
                  btnStyle = "bg-mint/30 dark:bg-success-900/30 border-success-500/20 cursor-default opacity-70";
                  badgeClass = "bg-emerald-500 text-white border border-emerald-300/40";
                  icon = "●";
                  titleStyle = "text-text-muted line-through";
                } else if (q.targetReached) {
                  btnText = "Claim Reward";
                  btnStyle = "bg-purple/10 dark:bg-purple/20 border-purple/30 cursor-pointer shadow-sm hover:bg-purple/20";
                  badgeClass = "bg-purple text-white border border-purple-400 shadow-sm";
                  icon = "⭐";
                  titleStyle = "text-purple dark:text-purple-400";
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => handleQuestClick(q)}
                    disabled={q.completed || questLoadingId === q.id}
                    className={`w-full flex items-start justify-between gap-4 p-4 rounded-2xl border transition text-left ${btnStyle}`}
                  >
                    <div className="flex items-start gap-3 max-w-[75%]">
                      <div className={`mt-0.5 flex-shrink-0 ${q.completed ? 'text-green-500' : 'text-purple'}`}>
                        {questLoadingId === q.id ? <RefreshCw className="h-4 w-4 animate-spin text-purple" /> : icon}
                      </div>
                      <div>
                        <h4 className={`text-xs font-bold ${titleStyle}`}>
                          {q.title}
                        </h4>
                        {q.description && (
                          <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{q.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                      <span className="text-[10px] font-bold text-purple block">
                        +{q.rewardPoints} GP
                      </span>
                      <span className={`mt-1 px-2.5 py-0.5 rounded-md text-[9px] font-bold tracking-wide ${badgeClass}`}>
                        {btnText}
                      </span>
                    </div>
                  </button>
                );
              })}
              {dailyQuests.length === 0 && (
                <div className="text-center p-6 bg-[#f8f3ff] dark:bg-slate-900/50 rounded-xl border border-lavender/20 dark:border-white/5">
                  <p className="text-xs font-bold text-text-muted">No quests available.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Quests */}
        <div className="app-panel p-5">
          <div className="liquid-card-content space-y-4">
            <div className="flex justify-between items-center border-b border-lavender/10 pb-2">
              <h3 className="font-extrabold text-sm sm:text-base text-text-main">Weekly Milestones</h3>
              <Badge color="blue">This Week</Badge>
            </div>

            <div className="space-y-3">
              {weeklyQuests.map((q) => {
                return (
                  <div
                    key={q.id}
                    className={`flex flex-col p-4 rounded-2xl border ${
                      q.completed
                        ? 'border-success-500/20 bg-mint/10 dark:bg-success-900/20 opacity-70'
                        : 'border-lavender/10 dark:border-white/10 bg-white dark:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className={`text-xs font-bold ${q.completed ? 'text-text-muted line-through' : 'text-text-main'}`}>{q.title}</h4>
                        <p className="text-[10px] text-text-muted mt-0.5 leading-relaxed">{q.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="text-[10px] font-bold text-purple block">+{q.rewardPoints} GP</span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-4">
                      <div className="flex-1">
                        <ProgressBar value={(Math.min(q.progress, q.target) / q.target) * 100} color="purple" showPercent={false} />
                        <span className="text-[9px] text-text-muted font-bold block mt-1">
                          Progress: {q.progress} / {q.target}
                        </span>
                      </div>
                      
                      {!q.completed && q.targetReached ? (
                        <button
                          onClick={() => handleQuestClick(q)}
                          disabled={questLoadingId === q.id}
                          className="bg-purple text-white hover:bg-purple-700 border border-purple-400 shadow-sm text-[10px] py-1.5 px-3 rounded-lg font-bold transition-all flex items-center"
                        >
                          {questLoadingId === q.id ? <RefreshCw className="h-3 w-3 animate-spin mr-1 inline" /> : null}
                          Claim Reward
                        </button>
                      ) : !q.completed ? (
                         <button
                          onClick={() => handleQuestClick(q)}
                          className="border border-slate-500/60 text-slate-500 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-700/60 text-[10px] py-1.5 px-3 rounded-lg font-bold transition-all"
                        >
                          Start Task
                        </button>
                      ) : (
                        <span className="bg-emerald-500 text-white border border-emerald-300/40 px-3 py-1.5 rounded-lg text-[10px] font-bold">
                          Claimed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {weeklyQuests.length === 0 && (
                <div className="text-center p-6 bg-[#f8f3ff] dark:bg-slate-900/50 rounded-xl border border-lavender/20 dark:border-white/5">
                  <p className="text-xs font-bold text-text-muted">No weekly milestones available.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyQuests;
