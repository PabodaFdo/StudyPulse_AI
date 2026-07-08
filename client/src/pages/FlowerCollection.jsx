import { useState, useEffect } from 'react';
import { Album, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import AnimatedCharacter from '../components/AnimatedCharacter';
import { flowerService } from '../services/flower.service';

const FLOWER_ICONS = {
  rose: '🌹',
  sunflower: '🌻',
  lotus: '🪷',
  orchid: '💮',
  cherry_blossom: '🌸',
  lavender: '🪻'
};

const FLOWER_COLORS = {
  rose: 'text-rose-400',
  sunflower: 'text-amber-400',
  lotus: 'text-indigo-400',
  orchid: 'text-fuchsia-400',
  cherry_blossom: 'text-pink-400',
  lavender: 'text-violet-400'
};

const FlowerCollection = () => {
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState(null);

  const fetchCollection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await flowerService.getCollection();
      setCollection(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load flower collection');
      toast.error('Failed to load flower collection');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCollection();
  }, []);

  const handleCheckUnlocks = async () => {
    try {
      setChecking(true);
      const response = await flowerService.checkUnlocks();
      if (response.newlyUnlocked && response.newlyUnlocked.length > 0) {
        toast.success(`Unlocked new flowers: ${response.newlyUnlocked.join(', ')}! 🌸`);
      } else {
        toast('No new unlocks found. Keep studying!', { icon: 'ℹ️' });
      }
      setCollection(response.data);
    } catch (err) {
      toast.error('Failed to check unlocks');
    } finally {
      setChecking(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'Epic': return 'purple';
      case 'Rare': return 'blue';
      case 'Common': return 'green';
      default: return 'gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(dateString));
  };

  const renderFlowerCard = (f, isLocked) => (
    <div
      key={f.flowerKey}
      className={`app-card p-5 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 ${
        isLocked ? 'opacity-65 bg-white/40 dark:bg-slate-900/40' : 'bg-white dark:bg-slate-900'
      }`}
    >
      <div className="flex flex-col justify-between h-full">
        <div>
          <div className="flex justify-between items-start mb-3">
            <span className={`text-4xl ${isLocked ? 'grayscale opacity-30' : FLOWER_COLORS[f.flowerKey] || 'text-brand-500'}`}>
              {FLOWER_ICONS[f.flowerKey] || '🌱'}
            </span>
            <Badge color={getRarityColor(f.rarity)}>
              {f.rarity}
            </Badge>
          </div>
          <h3 className="font-extrabold text-slate-900 dark:text-white text-base mt-2">{f.flowerName}</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
            {isLocked ? f.unlockCondition : (f.unlockReason || f.unlockCondition)}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-bold uppercase">Status</span>
          <span className={isLocked ? 'text-slate-500/80 dark:text-slate-400/80' : 'text-brand-600 dark:text-brand-400 font-extrabold'}>
            {isLocked ? 'Locked' : `Unlocked on ${formatDate(f.unlockedAt)}`}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flower Collection"
        subtitle="Review your unlocked digital flora, rarity tiers, and achievements."
        icon={Album}
      />

      <div className="app-panel p-6 bg-gradient-to-r from-brand-500/10 to-accent-500/5 mb-6 border border-slate-200 dark:border-slate-800 rounded-[32px]">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Unlock flowers by studying consistently</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 font-bold max-w-md">
              Complete quests, maintain your study garden, and focus on your revision to unlock rare and exotic seedlings for your digital collection!
            </p>
            <div className="pt-2">
              <Button onClick={handleCheckUnlocks} disabled={checking || loading} className="flex items-center gap-2">
                {checking ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Check New Unlocks
              </Button>
            </div>
          </div>
          <div className="flex-shrink-0">
            <AnimatedCharacter
              src="/src/assets/characters/plant-buddy.png"
              variant="plant"
              size="md"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-brand-500" />
          <p>Loading collection...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {collection?.unlockedFlowers?.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">Unlocked Flowers</h3>
                <Badge color="purple">{collection.unlockedCount} / {collection.totalFlowers}</Badge>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {collection.unlockedFlowers.map(f => renderFlowerCard(f, false))}
              </div>
            </div>
          )}

          {collection?.lockedFlowers?.length > 0 && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400">Locked Flowers</h3>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {collection.lockedFlowers.map(f => renderFlowerCard(f, true))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FlowerCollection;
