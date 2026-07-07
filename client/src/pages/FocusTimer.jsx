import { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, Settings, X } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Select from '../components/Select';
import api from '../services/api';

const DEFAULT_TIMER_SETTINGS = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const STORAGE_KEY = 'studypulse_timer_settings';

const FocusTimer = () => {
  const [mode, setMode] = useState('focus');
  const [modeTimes, setModeTimes] = useState(DEFAULT_TIMER_SETTINGS);
  const [secondsLeft, setSecondsLeft] = useState(DEFAULT_TIMER_SETTINGS.focus * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [openSettings, setOpenSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState(DEFAULT_TIMER_SETTINGS);

  const timerRef = useRef(null);
  const completionLockRef = useRef(false);
  const modeRef = useRef(mode);
  const modeTimesRef = useRef(modeTimes);
  const selectedSubjectIdRef = useRef(selectedSubjectId);

  useEffect(() => { modeRef.current = mode; }, [mode]);
  useEffect(() => { modeTimesRef.current = modeTimes; }, [modeTimes]);
  useEffect(() => { selectedSubjectIdRef.current = selectedSubjectId; }, [selectedSubjectId]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await api.get('/subjects');
        const subjectList = Array.isArray(res.data) ? res.data : [];

        setSubjects(subjectList);

        if (subjectList.length > 0) {
          setSelectedSubjectId(subjectList[0].id.toString());
        }
      } catch (err) {
        toast.error('Failed to load subjects');
      }
    };

    fetchSubjects();

    const savedSettings = localStorage.getItem(STORAGE_KEY);

    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);

        const safeSettings = {
          focus: Number(parsed.focus) || DEFAULT_TIMER_SETTINGS.focus,
          shortBreak: Number(parsed.shortBreak) || DEFAULT_TIMER_SETTINGS.shortBreak,
          longBreak: Number(parsed.longBreak) || DEFAULT_TIMER_SETTINGS.longBreak,
        };

        setModeTimes(safeSettings);
        setSettingsForm(safeSettings);
        setSecondsLeft(Math.floor(safeSettings.focus * 60));
      } catch (error) {
        console.error('Failed to parse timer settings', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            setIsRunning(false);
            
            if (!completionLockRef.current) {
              completionLockRef.current = true;
              handleModeComplete();
            }
            return 0;
          }

          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }

    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  const handleModeComplete = async () => {
    const currentMode = modeRef.current;
    const currentTimes = modeTimesRef.current;
    const currentSubjectId = selectedSubjectIdRef.current;

    try {
      if (currentMode === 'focus') {
        if (currentSubjectId) {
          try {
            await api.post('/focus-sessions', {
              subjectId: Number(currentSubjectId),
              durationMinutes: Number(currentTimes.focus),
              duration: Number(currentTimes.focus),
              sessionType: 'Focus',
            });

            toast.success(`Focus session complete! +10 points added.`);
          } catch (error) {
            toast.error(
              error.response?.data?.message
                ? `Failed to save focus session: ${error.response.data.message}`
                : 'Failed to save focus session'
            );
          }
        } else {
          toast.error('Please select a subject to save focus time.');
        }

        setMode('shortBreak');
        setSecondsLeft(Math.floor(currentTimes.shortBreak * 60));
      } else {
        toast('Break finished! Ready to focus?', { icon: '💪' });

        setMode('focus');
        setSecondsLeft(Math.floor(currentTimes.focus * 60));
      }
    } finally {
      setTimeout(() => {
        completionLockRef.current = false;
      }, 300);
    }
  };

  const changeMode = (newMode) => {
    setIsRunning(false);
    completionLockRef.current = false;
    setMode(newMode);
    setSecondsLeft(Math.floor(modeTimes[newMode] * 60));
  };

  const toggleTimer = () => {
    if (!isRunning) {
      if (mode === 'focus' && !selectedSubjectId) {
        toast.error('Please select a subject before starting a focus session.');
        return;
      }
      completionLockRef.current = false;
    }
    setIsRunning((prev) => !prev);
  };

  const resetTimer = () => {
    setIsRunning(false);
    completionLockRef.current = false;
    setSecondsLeft(Math.floor(modeTimes[mode] * 60));
    toast('Timer reset');
  };

  const openTimerSettings = () => {
    setSettingsForm(modeTimes);
    setOpenSettings(true);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();

    const isDev = import.meta.env.DEV;
    const minValue = isDev ? 0.01 : 1;

    const focus = Number(settingsForm.focus);
    const shortBreak = Number(settingsForm.shortBreak);
    const longBreak = Number(settingsForm.longBreak);

    const hasInvalidValue =
      Number.isNaN(focus) ||
      Number.isNaN(shortBreak) ||
      Number.isNaN(longBreak) ||
      focus < minValue ||
      shortBreak < minValue ||
      longBreak < minValue ||
      focus > 180 ||
      shortBreak > 180 ||
      longBreak > 180;

    if (hasInvalidValue) {
      toast.error(`Please enter valid durations between ${minValue} and 180 minutes.`);
      return;
    }

    const newSettings = {
      focus,
      shortBreak,
      longBreak,
    };

    setModeTimes(newSettings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));

    if (!isRunning) {
      setSecondsLeft(Math.floor(newSettings[mode] * 60));
    }

    setOpenSettings(false);
    toast.success('Timer settings updated!');
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);

    return `${mins.toString().padStart(2, '0')}:${remainingSecs
      .toString()
      .padStart(2, '0')}`;
  };

  const selectedModeLabel = mode === 'focus' ? 'Focus Interval' : 'Rest Phase';

  return (
    <div className="space-y-6">
      <PageHeader
        title="Focus Timer"
        subtitle="Pomodoro-style interval session timers to support intensive study cycles."
        icon={Timer}
      />

      <div className="max-w-md mx-auto">
        <div className="app-card p-8 text-center space-y-8">
          <div className="flex gap-2 justify-center items-center">
            {[
              { id: 'focus', label: `Focus (${modeTimes.focus}m)` },
              { id: 'shortBreak', label: `Short Break (${modeTimes.shortBreak}m)` },
              { id: 'longBreak', label: `Long Break (${modeTimes.longBreak}m)` },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => changeMode(item.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${mode === item.id
                    ? 'border-brand-500 bg-brand-500/10 text-[#241b4b] dark:border-cyan-400/60 dark:bg-cyan-400/10 dark:text-white'
                    : 'border-lavender/20 bg-transparent text-[#6b6388] hover:bg-lavender/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10'
                  }`}
              >
                {item.label}
              </button>
            ))}

            <button
              type="button"
              onClick={openTimerSettings}
              className="ml-2 rounded-xl border border-brand-500/40 bg-brand-500/15 p-2 text-brand-600 shadow-sm transition hover:bg-brand-500/25 dark:border-cyan-400/50 dark:bg-cyan-400/15 dark:text-cyan-200 dark:hover:bg-cyan-400/25"
              title="Timer Settings"
              aria-label="Timer Settings"
            >
              <Settings className="h-4 w-4" />
            </button>
          </div>

          {subjects.length > 0 ? (
            <div className="max-w-[220px] mx-auto text-left">
              <Select
                value={selectedSubjectId}
                onChange={(e) => setSelectedSubjectId(e.target.value)}
                disabled={isRunning}
                options={subjects.map((subject) => ({
                  value: subject.id.toString(),
                  label: subject.name || subject.subjectName || 'Untitled Subject',
                }))}
              />
            </div>
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Please create a subject first to track focus time.
            </div>
          )}

          <div className="relative inline-flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-brand-500/5 blur-xl" />

            <div className="relative flex h-56 w-56 flex-col items-center justify-center rounded-full border-4 app-soft-card rounded-full">
              <span className="font-mono text-4xl font-bold tracking-widest text-[#241b4b] dark:text-white sm:text-5xl">
                {formatTime(secondsLeft)}
              </span>
              <span className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {selectedModeLabel}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Button onClick={resetTimer} variant="secondary" className="p-3">
              <RotateCcw className="h-4 w-4" />
            </Button>

            <Button onClick={toggleTimer} className="px-6 py-3 font-bold gap-2">
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4" /> Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Start
                </>
              )}
            </Button>
          </div>

          <div className="flex gap-3 rounded-xl border border-warning-500/25 bg-warning-500/5 p-4 text-left">
            <Coffee className="mt-0.5 h-5 w-5 flex-shrink-0 text-warning-400" />
            <div className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              <span className="block font-semibold text-[#241b4b] dark:text-white">
                Avoid distractions
              </span>
              Close other browser tabs to protect your streak.
            </div>
          </div>
        </div>
      </div>

      {openSettings && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="relative w-full max-w-xl rounded-3xl border border-lavender/30 bg-[#f1e7ff] p-6 shadow-2xl dark:border-white/10 dark:bg-slate-900 dark:text-white">
            <button
              type="button"
              onClick={() => setOpenSettings(false)}
              className="absolute right-5 top-5 rounded-full p-2 text-[#241b4b] transition hover:bg-white/60 dark:text-white dark:hover:bg-white/10"
              aria-label="Close timer settings"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="mb-6 text-2xl font-bold text-[#241b4b] dark:text-white">
              Timer Settings
            </h2>

            <form onSubmit={handleSaveSettings} className="space-y-5 text-left">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#6b6388] dark:text-slate-200">
                  Focus Duration (minutes)
                </label>
                <input
                  type="number"
                  step="any"
                  value={settingsForm.focus}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, focus: e.target.value })
                  }
                  required
                  className="w-full rounded-2xl app-input px-5 py-4 text-[#241b4b] outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#6b6388] dark:text-slate-200">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  step="any"
                  value={settingsForm.shortBreak}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, shortBreak: e.target.value })
                  }
                  required
                  className="w-full rounded-2xl app-input px-5 py-4 text-[#241b4b] outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-[#6b6388] dark:text-slate-200">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  step="any"
                  value={settingsForm.longBreak}
                  onChange={(e) =>
                    setSettingsForm({ ...settingsForm, longBreak: e.target.value })
                  }
                  required
                  className="w-full rounded-2xl app-input px-5 py-4 text-[#241b4b] outline-none transition placeholder:text-gray-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                />
              </div>

              <div className="flex justify-end gap-3 pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setOpenSettings(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Settings</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusTimer;

