import { useState, useEffect } from 'react';
import { Flower2, Droplet, Sparkles, Loader, Timer, FileEdit, GraduationCap, Leaf } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../services/api';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';
import MagicalStars3D from '../components/MagicalStars3D';

import seedImage from '../assets/study-garden/18_gp_seed.png';
import smallSproutImage from '../assets/study-garden/33_gp_small_sprout.png';
import growingPlantImage from '../assets/study-garden/63_gp_growing_plant.png';
import healthyPlantImage from '../assets/study-garden/110_gp_healthy_plant.png';
import flowerBudsImage from '../assets/study-garden/170_gp_flower_buds.png';
import bloomingFlowersImage from '../assets/study-garden/240_gp_blooming_flowers.png';

const STAGES = [
  { name: 'Seed', min: 0, max: 20, icon: '🧎' },
  { name: 'Small Sprout', min: 21, max: 50, icon: '🌱' },
  { name: 'Growing Plant', min: 51, max: 100, icon: '🌿' },
  { name: 'Healthy Plant', min: 101, max: 160, icon: '🪴' },
  { name: 'Flower Buds', min: 161, max: 230, icon: '🪻' },
  { name: 'Blooming Flowers', min: 231, max: Infinity, icon: '🌸' }
];

const getStageFromPoints = (points) => {
  return STAGES.find(s => points >= s.min && points <= s.max) || STAGES[STAGES.length - 1];
};

const getPlantImage = (points) => {
  if (points <= 20) return seedImage;
  if (points <= 50) return smallSproutImage;
  if (points <= 100) return growingPlantImage;
  if (points <= 160) return healthyPlantImage;
  if (points <= 230) return flowerBudsImage;
  return bloomingFlowersImage;
};

const getStageProgress = (points) => {
  const stage = getStageFromPoints(points);
  if (stage.max === Infinity) {
    return { current: 100, required: 100, percent: 100, isMax: true };
  }
  const currentInStage = points - (stage.min === 0 ? 0 : stage.min - 1);
  const requiredInStage = stage.max - (stage.min === 0 ? 0 : stage.min - 1);
  return { 
    current: currentInStage, 
    required: requiredInStage, 
    percent: (currentInStage / requiredInStage) * 100,
    isMax: false
  };
};

const getActivityIcon = (activity) => {
  const lower = activity.toLowerCase();
  if (lower.includes('focus')) return <Timer className="w-4 h-4 text-blue-400" />;
  if (lower.includes('note')) return <FileEdit className="w-4 h-4 text-purple" />;
  if (lower.includes('academic')) return <GraduationCap className="w-4 h-4 text-yellow-500" />;
  if (lower.includes('water')) return <Droplet className="w-4 h-4 text-blue-500" />;
  if (lower.includes('fertilize')) return <Leaf className="w-4 h-4 text-green-500" />;
  return <Sparkles className="w-4 h-4 text-yellow-400" />;
};

const formatActivityLabel = (activity) => activity;

const formatDate = (dateString) => {
  const d = new Date(dateString);
  return `${d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

const StageTimeline = ({ currentPoints }) => {
  return (
    <div className="flex justify-between items-center mt-8 relative px-2 mb-2">
      {/* Background Line */}
      <div className="absolute left-0 top-1/2 w-full h-1.5 bg-lavender/20 dark:bg-white/5 -z-10 rounded-full overflow-hidden transform -translate-y-1/2">
        {/* Animated Progress Line */}
        <motion.div 
          className="h-full bg-gradient-to-r from-purple to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, (currentPoints / 231) * 100)}%` }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </div>
      
      {STAGES.map((stage) => {
        const isCompleted = currentPoints >= stage.min;
        const isCurrent = currentPoints >= stage.min && currentPoints <= stage.max;
        return (
          <div key={stage.name} className="flex flex-col items-center group relative">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-sm transition-all duration-300 z-10 ${
              isCurrent ? 'bg-purple text-white ring-4 ring-purple/30 scale-110 drop-shadow-[0_0_10px_rgba(168,85,247,0.8)]' :
              isCompleted ? 'bg-purple/80 text-white' : 'bg-white/80 dark:bg-[#2a2139] text-text-muted border-2 border-lavender/30 dark:border-white/10 opacity-60 grayscale'
            }`}>
              {stage.icon}
            </div>
            {/* Tooltip */}
            <span className="absolute -bottom-7 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-text-muted dark:text-white/80 pointer-events-none">
              {stage.name}
            </span>
          </div>
        )
      })}
    </div>
  )
}

const StudyGarden = () => {
  const [garden, setGarden] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEvolutionPopup, setShowEvolutionPopup] = useState(false);
  const [evolvedStage, setEvolvedStage] = useState(null);

  const fetchGardenData = async () => {
    try {
      const [gardenRes, activitiesRes] = await Promise.all([
        api.get('/study-garden'),
        api.get('/study-garden/activities')
      ]);
      setGarden(gardenRes.data);
      setActivities(activitiesRes.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch garden data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGardenData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-purple">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const totalPoints = garden?.level || 0;
  const currentStage = getStageFromPoints(totalPoints);
  const progress = getStageProgress(totalPoints);
  const recentActivities = activities.slice(0, 6);

  return (
    <div className="space-y-6 text-text-main relative">
      <PageHeader
        title="Study Garden"
        subtitle="Grow virtual flowers by completing focus sessions and daily study targets."
        icon={Flower2}
      />

      {/* Evolution Popup Modal */}
      <AnimatePresence>
        {showEvolutionPopup && evolvedStage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="app-panel p-8 max-w-sm w-full text-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-purple/20 blur-[80px] rounded-full pointer-events-none"></div>
              
              {/* Floating Sparkles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ y: 20, opacity: 0, scale: 0.5 }}
                  animate={{ 
                    y: -150, 
                    opacity: [0, 1, 0],
                    scale: [0.5, 1.5, 0.5],
                    x: Math.random() * 100 - 50
                  }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.2 }}
                  className="absolute top-3/4 left-1/2 text-yellow-300 text-xl pointer-events-none"
                >
                  ✨
                </motion.div>
              ))}

              <div className="relative z-10 space-y-6">
                <h2 className="text-3xl font-extrabold text-white drop-shadow-md">Your plant evolved!</h2>
                
                <motion.div 
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", bounce: 0.6, duration: 0.8, delay: 0.2 }}
                  className="text-8xl my-6 drop-shadow-2xl flex justify-center"
                >
                  <div className="relative">
                     <div className="absolute inset-0 bg-white/20 blur-2xl rounded-full scale-150"></div>
                     <span className="relative z-10">{evolvedStage.icon}</span>
                  </div>
                </motion.div>
                
                <div>
                  <p className="text-lg text-purple font-bold">Your plant reached</p>
                  <p className="text-2xl font-extrabold text-white mt-1">{evolvedStage.name}</p>
                  <p className="text-sm text-text-muted mt-3">Keep studying to grow your garden.</p>
                </div>
                
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                  <Button 
                    onClick={() => setShowEvolutionPopup(false)}
                    className="w-full justify-center py-3 font-bold mt-2 hover:scale-[1.02] transition-transform"
                    variant="primary"
                  >
                    Continue
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid gap-6 lg:grid-cols-3 z-10 relative">
        {/* Garden Visual Card */}
        <div className="app-panel p-6 min-h-[380px] relative transition-all hover:shadow-md overflow-hidden flex flex-col justify-center">
          <div className="absolute inset-0 bg-gradient-to-b from-purple/5 to-transparent pointer-events-none"></div>
          
          <div className="liquid-card-content flex flex-col items-center justify-center h-full w-full relative z-10">
            {/* Background glowing orb */}
            <div className="absolute inset-0 bg-green-500/5 dark:bg-green-500/10 blur-[60px] rounded-full scale-150 transform-gpu z-0 pointer-events-none"></div>
            
            <div className="flex flex-col items-center flex-1 justify-center w-full relative">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="w-full flex justify-center relative z-10"
              >
                <div className="relative inline-flex items-center justify-center overflow-visible w-full">
                  <MagicalStars3D />
                  <img
                    src={getPlantImage(totalPoints)}
                    alt={currentStage.name}
                    className="relative z-[5] w-full max-w-[260px] h-[360px] object-contain drop-shadow-2xl"
                  />
                </div>
              </motion.div>
              <span className="text-[10px] text-text-muted font-bold mt-6 tracking-wider z-10 px-3 py-1 app-soft-card rounded-full">
                STUDY GARDEN
              </span>
            </div>
          </div>
        </div>

        {/* Growth Status & Actions */}
        <div className="app-panel p-6 relative transition-all hover:shadow-md">
          <div className="liquid-card-content flex flex-col justify-between h-full space-y-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-lavender/20 dark:border-purple/20 pb-4">
                <div>
                  <h3 className="text-xl font-extrabold text-text-main dark:text-white">Growth Status</h3>
                  <p className="text-xs text-text-muted font-medium mt-1">Nurture your plant to advance.</p>
                </div>
                <div className="p-2 bg-purple/10 rounded-xl">
                  <Leaf className="w-5 h-5 text-purple" />
                </div>
              </div>

              <div className="space-y-4 app-card p-5 shadow-inner">
                <div className="flex justify-between items-end">
                  <div className="space-y-1">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Total Growth</span>
                    <span className="text-2xl font-black text-purple drop-shadow-sm">{totalPoints} <span className="text-sm">GP</span></span>
                  </div>
                  <div className="text-right space-y-1">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider block">Current Stage</span>
                    <span className="text-sm font-bold text-text-main dark:text-white bg-purple/10 px-2 py-0.5 rounded-md text-purple">{currentStage.name}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-lavender/10 dark:border-white/5 mt-2">
                  <div className="flex justify-between text-xs font-bold mb-2 mt-2">
                    <span className="text-text-muted">Progress to Next Stage</span>
                    <span className="text-purple">
                      {progress.isMax ? 'Max Stage Reached' : `${progress.current} / ${progress.required} GP`}
                    </span>
                  </div>
                  <ProgressBar value={progress.percent} color="green" showPercent={false} className="h-2.5 shadow-inner" />
                </div>
              </div>

              {/* Visual Timeline */}
              <StageTimeline currentPoints={totalPoints} />
            </div>

            <div className="space-y-3 pt-2">
              <div className="bg-purple/5 border border-purple/20 rounded-xl p-4 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 opacity-10">
                   <Flower2 className="w-16 h-16" />
                </div>
                <h4 className="font-extrabold text-sm text-purple mb-2 relative z-10 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> How to grow your garden
                </h4>
                <p className="text-xs text-text-muted mb-3 relative z-10 leading-relaxed font-medium">
                  Complete focus sessions, revise notes, and update academic records to earn Growth Points automatically.
                </p>
                <div className="flex flex-wrap gap-2 relative z-10">
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-1 rounded-md border border-blue-500/20 shadow-sm">
                    <Timer className="w-3 h-3" /> +10 GP Focus
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-purple/10 text-purple px-2 py-1 rounded-md border border-purple/20 shadow-sm">
                    <FileEdit className="w-3 h-3" /> +5 GP Note
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 px-2 py-1 rounded-md border border-yellow-500/20 shadow-sm">
                    <GraduationCap className="w-3 h-3" /> +3 GP Record
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities Log */}
        <div className="app-panel p-6 relative transition-all hover:shadow-md flex flex-col">
          <div className="liquid-card-content flex flex-col h-full">
            <div className="flex items-center justify-between border-b border-lavender/20 dark:border-purple/20 pb-4 mb-4">
              <h3 className="text-xl font-extrabold text-text-main dark:text-white">Recent Log</h3>
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Timer className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {recentActivities.length > 0 ? (
                <div className="space-y-3 pb-2">
                  {recentActivities.map((activity) => (
                    <div 
                      key={activity.id} 
                      className="flex items-start gap-3 p-3 rounded-xl app-soft-card transition-all shadow-sm hover:shadow"
                    >
                      <div className="mt-0.5 p-2 app-soft-card rounded-lg shadow-sm">
                        {getActivityIcon(activity.activity)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-text-main dark:text-white leading-tight mb-1">
                          {formatActivityLabel(activity.activity)}
                        </p>
                        <p className="text-[10px] font-medium text-text-muted uppercase tracking-wider">
                          {formatDate(activity.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-60 pb-8">
                  <Leaf className="w-8 h-8 text-text-muted" />
                  <p className="text-sm font-medium text-text-muted">No garden activity yet.</p>
                  <p className="text-xs text-text-muted/80">Complete study actions to grow your plant.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyGarden;
