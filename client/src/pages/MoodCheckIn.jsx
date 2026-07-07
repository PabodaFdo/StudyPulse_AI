import { useState, useEffect } from 'react';
import { Smile, Send, Trash2, Activity, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import TextArea from '../components/TextArea';
import Badge from '../components/Badge';
import { moodService } from '../services/mood.service';

const MoodCheckIn = () => {
  const [mood, setMood] = useState(null);
  const [energyLevel, setEnergyLevel] = useState(3);
  const [stressLevel, setStressLevel] = useState(3);
  const [journalNote, setJournalNote] = useState('');
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [checkInsData, summaryData] = await Promise.all([
        moodService.getCheckIns(),
        moodService.getSummary()
      ]);
      setHistory(checkInsData);
      setSummary(summaryData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load mood data');
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    { value: 1, label: 'Very Low', emoji: '😴' },
    { value: 2, label: 'Low', emoji: '😕' },
    { value: 3, label: 'Okay', emoji: '😌' },
    { value: 4, label: 'Good', emoji: '😊' },
    { value: 5, label: 'Excellent', emoji: '⚡' },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!mood) {
      toast.error('Please select a mood emoji first');
      return;
    }
    
    setSubmitting(true);
    try {
      await moodService.createCheckIn({
        mood: mood.value,
        energyLevel,
        stressLevel,
        journalNote
      });
      toast.success('Mood logged successfully!');
      
      setMood(null);
      setEnergyLevel(3);
      setStressLevel(3);
      setJournalNote('');
      
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save mood check-in');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await moodService.deleteCheckIn(id);
      toast.success('Check-in deleted');
      await fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete check-in');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mood Check-in"
        subtitle="Log your daily feelings to calibrate stress predictions and maintain subject health."
        icon={Smile}
      />

      {summary && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="app-card p-4 flex flex-col items-center justify-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs mb-1">Avg Mood (7d)</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Smile className="h-5 w-5 text-blue-400" /> {summary.averageMood || 0}
            </span>
          </div>
          <div className="app-card p-4 flex flex-col items-center justify-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs mb-1">Avg Energy (7d)</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-400" /> {summary.averageEnergy || 0}
            </span>
          </div>
          <div className="app-card p-4 flex flex-col items-center justify-center">
            <span className="text-slate-500 dark:text-slate-400 text-xs mb-1">Avg Stress (7d)</span>
            <span className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5 text-red-400" /> {summary.averageStress || 0}
            </span>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Form log */}
        <div className="lg:col-span-2 app-panel p-5 space-y-6">
          <h3 className="font-bold text-slate-900 dark:text-white text-base">How are you feeling today?</h3>
          
          <div className="grid grid-cols-5 gap-3">
            {moods.map((m) => (
              <button
                key={m.label}
                onClick={() => setMood(m)}
                className={`p-3 rounded-2xl border flex flex-col items-center justify-center text-center cursor-pointer transition ${
                  mood?.value === m.value
                    ? 'border-brand-500 bg-brand-500/10'
                    : 'app-soft-card hover:bg-purple-100/50 dark:hover:bg-slate-800/50'
                }`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 mt-1.5">{m.label}</span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Energy Level (1-5)</label>
                <input 
                  type="range" min="1" max="5" 
                  value={energyLevel} 
                  onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Stress Level (1-5)</label>
                <input 
                  type="range" min="1" max="5" 
                  value={stressLevel} 
                  onChange={(e) => setStressLevel(parseInt(e.target.value))}
                  className="w-full accent-brand-500"
                />
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>Low</span>
                  <span>High</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-200">Journal Thoughts (Optional)</label>
              <textarea
                placeholder="What made you feel this way? Any academic hurdles?"
                rows={3}
                value={journalNote}
                onChange={(e) => setJournalNote(e.target.value)}
                className="w-full p-3 rounded-xl app-input text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <Button type="submit" className="w-full justify-center gap-1.5" disabled={submitting}>
              <Send className="h-4 w-4" /> {submitting ? 'Saving...' : 'Save Mood Entry'}
            </Button>
          </form>
        </div>

        {/* History Panel */}
        <div className="app-panel p-5 space-y-4">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">Recent Check-ins</h3>
          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {history.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-4">No check-ins yet.</p>
            ) : (
              history.map((h) => {
                const date = new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const time = new Date(h.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
                const mEmoji = moods.find(m => m.value === h.mood)?.emoji || '😶';
                
                return (
                  <div key={h.id} className="p-3.5 app-soft-card rounded-xl space-y-2 relative group">
                    <button 
                      onClick={() => handleDelete(h.id)}
                      className="absolute top-2 right-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                      title="Delete entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex justify-between items-center text-xs">
                      <Badge color="purple">{mEmoji} {h.moodLabel}</Badge>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">{date} {time}</span>
                    </div>
                    <div className="flex gap-3 text-xs text-slate-600 dark:text-slate-300">
                      <span>Energy: {h.energyLevel}</span>
                      <span>Stress: {h.stressLevel}</span>
                    </div>
                    {h.journalNote && (
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed mt-1 bg-slate-200/50 dark:bg-black/20 p-2 rounded-lg">{h.journalNote}</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoodCheckIn;
