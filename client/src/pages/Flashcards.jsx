import { useState, useEffect, useMemo } from 'react';
import { 
  Layers, RotateCw, ChevronLeft, ChevronRight, RefreshCw, 
  PlusCircle, AlertTriangle, FileText, Check, Clock, Star, Shuffle, Save 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Select from '../components/Select';
import Modal from '../components/Modal';
import { generateFlashcards } from '../services/flashcard.service';
import { saveFlashcards } from '../services/aiLibrary.service';
import { getStudyMaterials } from '../services/studyMaterial.service';
import { saveFlashcardReviewAttempt } from '../services/flashcardReview.service';
import api from '../services/api';

const Flashcards = () => {
  const navigate = useNavigate();
  const [extractedText, setExtractedText] = useState('');
  const [source, setSource] = useState('pdf');
  
  const [savedMaterials, setSavedMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  
  const [savedNotes, setSavedNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [loadingSources, setLoadingSources] = useState(true);

  const [cardCount, setCardCount] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');

  const [flashcardsData, setFlashcardsData] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [flashcardStatuses, setFlashcardStatuses] = useState({});
  const [showCompletion, setShowCompletion] = useState(false);
  const [hasSavedAttempt, setHasSavedAttempt] = useState(false);

  useEffect(() => {
    const text = localStorage.getItem('studypulse_extracted_text');
    if (text) setExtractedText(text);

    fetchSources();

    const savedCards = localStorage.getItem('studypulse_generated_flashcards');
    if (savedCards) {
      try {
        setFlashcardsData(JSON.parse(savedCards));
      } catch (e) {
        console.error('Failed to parse saved flashcards');
      }
    }

    const savedIdx = localStorage.getItem('studypulse_flashcard_current_index');
    if (savedIdx !== null) {
      setCurrentIdx(parseInt(savedIdx, 10));
    }

    const savedFlipped = localStorage.getItem('studypulse_flashcard_flipped');
    if (savedFlipped === 'true') {
      setFlipped(true);
    }

    const savedStatuses = localStorage.getItem('studypulse_flashcard_status');
    if (savedStatuses) {
      try {
        setFlashcardStatuses(JSON.parse(savedStatuses));
      } catch (e) {
        console.error('Failed to parse saved statuses');
      }
    }
  }, []);

  const fetchSources = async () => {
    setLoadingSources(true);
    try {
      const [notesRes, materialsRes] = await Promise.all([
        api.get('/notes').catch(() => ({ data: [] })),
        getStudyMaterials().catch(() => [])
      ]);
      
      const normalizeList = (response) => {
        const payload = response?.data ?? response;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        return [];
      };

      const notes = normalizeList(notesRes);
      const materials = normalizeList(materialsRes);
      
      setSavedNotes(notes);
      setSavedMaterials(materials);
      
      let finalNoteId = localStorage.getItem('studypulse_flashcard_selected_note_id');
      if (notes.length > 0) {
        const exists = notes.find(n => n.id.toString() === finalNoteId);
        if (!exists) {
          finalNoteId = notes[0].id.toString();
          localStorage.setItem('studypulse_flashcard_selected_note_id', finalNoteId);
        }
        setSelectedNoteId(finalNoteId);
      } else if (finalNoteId) {
        localStorage.removeItem('studypulse_flashcard_selected_note_id');
        setSelectedNoteId('');
      }

      let finalMaterialId = localStorage.getItem('studypulse_selected_material_id');
      if (materials.length > 0) {
        const exists = materials.find(m => m.id.toString() === finalMaterialId);
        if (!exists) {
          finalMaterialId = materials[0].id.toString();
          localStorage.setItem('studypulse_selected_material_id', finalMaterialId);
        }
        setSelectedMaterialId(finalMaterialId);
      } else if (finalMaterialId) {
        localStorage.removeItem('studypulse_selected_material_id');
        setSelectedMaterialId('');
      }

      const initialSource = localStorage.getItem('studypulse_flashcard_source') || 
        (materials.length > 0 || localStorage.getItem('studypulse_extracted_text') ? 'pdf' : 'note');
      
      setSource(initialSource);

    } catch (error) {
      console.error('Failed to load sources', error);
      const initialSource = localStorage.getItem('studypulse_flashcard_source') || 'pdf';
    } finally {
      setLoadingSources(false);
    }
  };

  const handleSourceChange = (newSource) => {
    setSource(newSource);
    localStorage.setItem('studypulse_flashcard_source', newSource);
  };

  const handleMaterialChange = (newMaterialId) => {
    setSelectedMaterialId(newMaterialId);
    localStorage.setItem('studypulse_selected_material_id', newMaterialId);
  };

  const handleNoteChange = (newNoteId) => {
    setSelectedNoteId(newNoteId);
    localStorage.setItem('studypulse_flashcard_selected_note_id', newNoteId);
  };

  const stats = useMemo(() => {
    let known = 0;
    let needReview = 0;
    
    if (flashcardsData && flashcardsData.flashcards) {
      flashcardsData.flashcards.forEach((c, i) => {
        const id = c.id || i;
        const s = flashcardStatuses[id];
        if (s === 'known') known++;
        else if (s === 'learning' || s === 'need_review') needReview++;
      });
    }
    
    const total = flashcardsData?.flashcards?.length || 0;
    const reviewed = known + needReview;
    const remaining = total - reviewed;
    const accuracy = total > 0 ? (known / total) * 100 : 0;
    
    return { known, needReview, remaining, total, reviewed, accuracy };
  }, [flashcardsData, flashcardStatuses]);

  useEffect(() => {
    const saveAttempt = async () => {
      if (showCompletion && flashcardsData && !hasSavedAttempt) {
        setHasSavedAttempt(true);
        try {
          let sourceTitle = 'Extracted Text';
          if (source === 'note') {
            const note = savedNotes.find(n => n.id.toString() === selectedNoteId.toString());
            if (note) sourceTitle = note.title;
          } else if (selectedMaterialId) {
            const mat = savedMaterials.find(m => m.id.toString() === selectedMaterialId.toString());
            if (mat) sourceTitle = mat.title;
          }

          await saveFlashcardReviewAttempt({
            subjectId: null,
            flashcardDeckId: flashcardsData.id || null,
            sourceTitle,
            totalCards: stats.total,
            reviewedCards: stats.reviewed,
            knownCards: stats.known,
            needReviewCards: stats.needReview,
            accuracy: stats.accuracy
          });
          toast.success('Review attempt saved successfully.');
        } catch (error) {
          console.error('Failed to save review attempt:', error);
        }
      }
    };
    saveAttempt();
  }, [showCompletion, flashcardsData, hasSavedAttempt, stats, source, savedNotes, selectedNoteId, savedMaterials, selectedMaterialId]);

  const handleGenerate = async () => {
    let textToUse = '';
    
    if (source === 'pdf') {
      if (selectedMaterialId) {
        const material = savedMaterials.find(m => m.id.toString() === selectedMaterialId.toString());
        if (material) {
          textToUse = material.extractedText;
        }
      }
      
      if (!textToUse && extractedText) {
        textToUse = extractedText;
      }

      if (!textToUse) {
        toast.error('No PDF text found. Please upload a PDF first.');
        return;
      }
    } else if (source === 'note') {
      if (!selectedNoteId) {
        toast.error('Please select study material before generating flashcards.');
        return;
      }
      const note = savedNotes.find(n => n.id.toString() === selectedNoteId.toString());
      if (!note || !note.content || note.content.trim() === '' || note.content === 'Type your notes here...') {
        toast.error('This note does not have enough content to generate flashcards.');
        return;
      }
      textToUse = note.content;
    }

    if (!textToUse) {
      toast.error('Please select study material before generating flashcards.');
      return;
    }

    setLoading(true);
    try {
      const response = await generateFlashcards({
        text: textToUse,
        card_count: cardCount,
        difficulty: difficulty
      });

      if (response && response.success) {
        const cardsWithIds = response.flashcards.map((c, i) => ({
          ...c,
          id: c.id || `gen-${Date.now()}-${i}`
        }));
        const finalResponse = { ...response, flashcards: cardsWithIds };

        setFlashcardsData(finalResponse);
        setCurrentIdx(0);
        setFlipped(false);
        setShowCompletion(false);
        setFlashcardStatuses({});
        setHasSavedAttempt(false);

        localStorage.setItem('studypulse_generated_flashcards', JSON.stringify(finalResponse));
        localStorage.setItem('studypulse_flashcard_current_index', '0');
        localStorage.setItem('studypulse_flashcard_flipped', 'false');
        localStorage.removeItem('studypulse_flashcard_status');

        toast.success('Flashcards generated successfully!');
      } else {
        toast.error('Failed to generate flashcards.');
      }
    } catch (error) {
      toast.error('Error generating flashcards.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (!flashcardsData || !flashcardsData.flashcards) return;
    if (currentIdx < flashcardsData.flashcards.length - 1) {
      const newIdx = currentIdx + 1;
      setCurrentIdx(newIdx);
      setFlipped(false);
      localStorage.setItem('studypulse_flashcard_current_index', newIdx.toString());
      localStorage.setItem('studypulse_flashcard_flipped', 'false');
    } else {
      setShowCompletion(true);
    }
  };

  const handlePrev = () => {
    if (currentIdx > 0) {
      const newIdx = currentIdx - 1;
      setCurrentIdx(newIdx);
      setFlipped(false);
      setShowCompletion(false);
      localStorage.setItem('studypulse_flashcard_current_index', newIdx.toString());
      localStorage.setItem('studypulse_flashcard_flipped', 'false');
    }
  };

  const handleReset = () => {
    setCurrentIdx(0);
    setFlipped(false);
    setShowCompletion(false);
    setHasSavedAttempt(false);
    localStorage.setItem('studypulse_flashcard_current_index', '0');
    localStorage.setItem('studypulse_flashcard_flipped', 'false');
  };

  const handleShuffle = () => {
    if (!flashcardsData || !flashcardsData.flashcards) return;
    
    const shuffledCards = [...flashcardsData.flashcards].sort(() => Math.random() - 0.5);
    const newData = { ...flashcardsData, flashcards: shuffledCards };
    
    setFlashcardsData(newData);
    setCurrentIdx(0);
    setFlipped(false);
    setShowCompletion(false);
    
    localStorage.setItem('studypulse_generated_flashcards', JSON.stringify(newData));
    localStorage.setItem('studypulse_flashcard_current_index', '0');
    localStorage.setItem('studypulse_flashcard_flipped', 'false');
  };

  const handleNew = () => {
    setFlashcardsData(null);
    setCurrentIdx(0);
    setFlipped(false);
    setShowCompletion(false);
    setFlashcardStatuses({});
    setHasSavedAttempt(false);
    
    localStorage.removeItem('studypulse_generated_flashcards');
    localStorage.removeItem('studypulse_flashcard_current_index');
    localStorage.removeItem('studypulse_flashcard_flipped');
    localStorage.removeItem('studypulse_flashcard_status');
  };

  const handleOpenSaveModal = () => {
    setSaveTitle(`Flashcards - ${new Date().toLocaleDateString()}`);
    setIsModalOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!saveTitle.trim()) {
      toast.error('Please enter a title.');
      return;
    }

    try {
      setIsSaving(true);
      let sourceTitle = "Extracted PDF Material";
      if (source === 'note') {
        const note = savedNotes.find(n => n.id.toString() === selectedNoteId.toString());
        sourceTitle = note ? note.title : 'Saved Note';
      } else if (selectedMaterialId) {
        const mat = savedMaterials.find(m => m.id.toString() === selectedMaterialId.toString());
        if (mat) sourceTitle = mat.title;
      }

      await saveFlashcards({
        title: saveTitle.trim(),
        sourceType: source,
        sourceTitle,
        flashcards: flashcardsData.flashcards,
        wordCount: flashcardsData.word_count
      });
      toast.success('Flashcards saved to My AI Library.');
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save flashcards.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFlip = () => {
    const newFlipped = !flipped;
    setFlipped(newFlipped);
    localStorage.setItem('studypulse_flashcard_flipped', newFlipped.toString());
  };

  const handleMarkStatus = (status) => {
    if (!flashcardsData || !flashcardsData.flashcards) return;
    const currentCard = flashcardsData.flashcards[currentIdx];
    const cardId = currentCard.id || currentIdx;
    
    const newStatuses = {
      ...flashcardStatuses,
      [cardId]: status
    };
    
    setFlashcardStatuses(newStatuses);
    localStorage.setItem('studypulse_flashcard_status', JSON.stringify(newStatuses));
    toast.success(`Marked as ${status}`, { icon: status === 'known' ? '✅' : status === 'learning' ? '🕒' : '⭐' });
  };

  const handleReviewLearning = () => {
    if (!flashcardsData || !flashcardsData.flashcards) return;
    const learningCards = flashcardsData.flashcards.filter((c, i) => {
      const id = c.id || i;
      return flashcardStatuses[id] === 'learning' || flashcardStatuses[id] === 'need_review';
    });
    
    if (learningCards.length === 0) {
      toast.success('No cards marked for review!');
      return;
    }
    
    const newData = { ...flashcardsData, flashcards: learningCards };
    setFlashcardsData(newData);
    setCurrentIdx(0);
    setFlipped(false);
    setShowCompletion(false);
    setHasSavedAttempt(false);
    
    localStorage.setItem('studypulse_generated_flashcards', JSON.stringify(newData));
    localStorage.setItem('studypulse_flashcard_current_index', '0');
    localStorage.setItem('studypulse_flashcard_flipped', 'false');
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (!flashcardsData || showCompletion) return;
      
      switch (e.key) {
        case ' ':
          e.preventDefault();
          handleFlip();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'ArrowLeft':
          handlePrev();
          break;
        case 'k':
        case 'K':
          if (flipped) handleMarkStatus('known');
          break;
        case 'l':
        case 'L':
        case 'n':
        case 'N':
          if (flipped) handleMarkStatus('need_review');
          break;
        default:
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flashcardsData, currentIdx, flipped, showCompletion, flashcardStatuses]);

  const renderSetup = () => {
    if (loadingSources) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-500 animate-pulse">Loading study materials...</p>
        </div>
      );
    }

    if (!extractedText && savedMaterials.length === 0 && savedNotes.length === 0) {
      return (
        <EmptyState
          icon={FileText}
          title="No study material found"
          description="Upload a PDF or create a Smart Note first to generate flashcards."
          action={
            <div className="flex gap-4 mt-4">
              <Button onClick={() => navigate('/upload-pdf')} variant="primary">
                Go to Upload PDF
              </Button>
              <Button onClick={() => navigate('/smart-notes')} variant="secondary">
                Go to Smart Notes
              </Button>
            </div>
          }
        />
      );
    }

    const safeMaterials = Array.isArray(savedMaterials) ? savedMaterials : [];
    const safeNotes = Array.isArray(savedNotes) ? savedNotes : [];

    // Determine available sources
    const sourceOptions = [];
    if (extractedText || safeMaterials.length > 0) sourceOptions.push({ label: 'Saved PDF Material', value: 'pdf' });
    if (safeNotes.length > 0) sourceOptions.push({ label: 'Saved Smart Note', value: 'note' });

    return (
      <div className="glass-card max-w-xl mx-auto p-6 md:p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-500/10 mb-4">
            <Layers className="h-8 w-8 text-brand-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Flashcard Setup</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            Configure how you want your flashcards generated from your study material.
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <Select
              label="Study Source"
              value={source}
              onChange={(e) => handleSourceChange(e.target.value)}
              options={sourceOptions}
            />
          </div>

          {source === 'pdf' && safeMaterials.length > 0 && (
            <div className="space-y-1 animate-fade-in">
              <Select
                label="Select PDF Material"
                value={selectedMaterialId}
                onChange={(e) => handleMaterialChange(e.target.value)}
                options={safeMaterials.map(m => ({
                  label: m.title,
                  value: m.id.toString()
                }))}
              />
            </div>
          )}
          {source === 'pdf' && safeMaterials.length === 0 && extractedText && (
             <p className="text-[11px] text-brand-400 font-medium px-2">Using extracted PDF text from your last uploaded material.</p>
          )}
          {source === 'pdf' && safeMaterials.length === 0 && !extractedText && (
             <p className="text-[11px] text-brand-400 font-medium px-2">No saved PDF materials found. Upload a PDF first.</p>
          )}

          {source === 'note' && (
            <div className="space-y-1 animate-fade-in">
              <Select
                label="Select Note"
                value={selectedNoteId}
                onChange={(e) => handleNoteChange(e.target.value)}
                options={safeNotes.map(n => ({
                  label: `${n.title} — ${n.subject?.name || 'Unknown Subject'}`,
                  value: n.id.toString()
                }))}
              />
              <p className="text-[11px] text-brand-400 font-medium px-2">Choose one of your saved Smart Notes to create flashcards.</p>
            </div>
          )}

          <Select
            label="Number of Flashcards"
            value={cardCount}
            onChange={(e) => setCardCount(Number(e.target.value))}
            options={[
              { label: '5 Cards', value: 5 },
              { label: '10 Cards', value: 10 },
              { label: '15 Cards', value: 15 },
              { label: '20 Cards', value: 20 },
            ]}
          />

          <Select
            label="Difficulty"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            options={[
              { label: 'Easy', value: 'easy' },
              { label: 'Medium', value: 'medium' },
              { label: 'Hard', value: 'hard' },
            ]}
          />

          <Button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full mt-4"
            variant="primary"
          >
            {loading ? <LoadingSpinner size="sm" /> : 'Generate Flashcards'}
          </Button>
        </div>
      </div>
    );
  };

  const renderCompletion = () => (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto py-12 space-y-8 glass-card p-8 text-center animate-fade-in">
      <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-success-500/10 mb-2">
        <Check className="h-10 w-10 text-success-500" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Great job! You reviewed your flashcards.</h2>
      
      <div className="grid grid-cols-4 gap-4 w-full max-w-lg">
        <div className="bg-cyan-500/10 border border-cyan-400/30 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-cyan-600 dark:text-cyan-300">{stats.total}</div>
          <div className="text-xs text-slate-600 dark:text-slate-300 uppercase font-semibold">Total Cards</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-400/30 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-300">{stats.known}</div>
          <div className="text-xs text-slate-600 dark:text-slate-300 uppercase font-semibold">Known</div>
        </div>
        <div className="bg-amber-500/10 border border-amber-400/30 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-300">{stats.needReview}</div>
          <div className="text-xs text-slate-600 dark:text-slate-300 uppercase font-semibold">Need Review</div>
        </div>
        <div className="bg-violet-500/10 border border-violet-400/30 p-4 rounded-xl text-center">
          <div className="text-2xl font-bold text-violet-600 dark:text-violet-300">{Math.round(stats.accuracy)}%</div>
          <div className="text-xs text-slate-600 dark:text-slate-300 uppercase font-semibold">Accuracy</div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <Button onClick={handleReviewLearning} variant="secondary" className="border-warning-500/30 text-warning-500">
          <Clock className="h-4 w-4 mr-2" /> Review Again
        </Button>
        <Button onClick={handleReset} variant="secondary">
          <RefreshCw className="h-4 w-4 mr-2" /> Restart Deck
        </Button>
        <Button onClick={handleNew} variant="primary">
          <PlusCircle className="h-4 w-4 mr-2" /> New Flashcards
        </Button>
      </div>
    </div>
  );

  const renderFlashcards = () => {
    if (!flashcardsData || !flashcardsData.flashcards || flashcardsData.flashcards.length === 0) {
      return <EmptyState title="No flashcards generated" description="Try generating again." />;
    }

    if (showCompletion) {
      return renderCompletion();
    }

    const currentCard = flashcardsData.flashcards[currentIdx];
    
    return (
      <div className="flex flex-col items-center max-w-3xl mx-auto space-y-4">
        {/* Progress Stats */}
        <div className="flex flex-wrap gap-4 items-center justify-center text-xs w-full bg-white/5 p-3 rounded-xl border border-white/10 shadow-sm">
          <span className="text-success-500 font-semibold flex items-center gap-1"><Check className="h-3 w-3" /> Known: {stats.known}</span>
          <span className="text-warning-500 font-semibold flex items-center gap-1"><Clock className="h-3 w-3" /> Need Review: {stats.needReview}</span>
          <span className="text-purple-500 font-semibold flex items-center gap-1"><Star className="h-3 w-3" /> Accuracy: {Math.round(stats.accuracy)}%</span>
          <span className="text-gray-400 font-semibold ml-auto border-l border-white/10 pl-4">Remaining: {stats.remaining}</span>
        </div>

        {/* Top controls */}
        <div className="flex w-full justify-between items-center mt-2">
          <div className="flex gap-2">
            <Button onClick={handleReset} variant="ghost" size="sm" className="gap-2 text-xs">
              <RefreshCw className="h-3 w-3" /> Reset Cards
            </Button>
            <Button onClick={handleShuffle} variant="ghost" size="sm" className="gap-2 text-xs">
              <Shuffle className="h-3 w-3" /> Shuffle Cards
            </Button>
            <Button onClick={handleNew} variant="ghost" size="sm" className="gap-2 text-xs">
              <PlusCircle className="h-3 w-3" /> New Flashcards
            </Button>
            <Button 
              onClick={handleOpenSaveModal} 
              disabled={isSaving} 
              variant="primary" 
              size="sm" 
              className="gap-2 text-xs"
            >
              <Save className="h-3 w-3" /> {isSaving ? 'Saving...' : 'Save Flashcards'}
            </Button>
          </div>
          <div className="text-sm font-semibold text-gray-500">
            Card {currentIdx + 1} of {stats.total}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 dark:bg-slate-700/50 h-1.5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-brand-500 transition-all duration-300"
            style={{ width: `${((currentIdx + 1) / stats.total) * 100}%` }}
          />
        </div>

        {/* Navigation Dots */}
        <div className="flex flex-wrap gap-1.5 justify-center max-w-2xl mx-auto my-2">
          {flashcardsData.flashcards.map((c, i) => {
            const id = c.id || i;
            const status = flashcardStatuses[id];
            let bgColor = 'bg-gray-300 dark:bg-slate-600';
            if (status === 'known') bgColor = 'bg-success-500';
            if (status === 'learning' || status === 'need_review') bgColor = 'bg-warning-500';
            
            const isCurrent = currentIdx === i;
            
            return (
              <button
                key={id}
                onClick={() => {
                  setCurrentIdx(i);
                  setFlipped(false);
                  setShowCompletion(false);
                  localStorage.setItem('studypulse_flashcard_current_index', i.toString());
                  localStorage.setItem('studypulse_flashcard_flipped', 'false');
                }}
                className={`w-2.5 h-2.5 rounded-full transition-all ${bgColor} ${isCurrent ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-slate-900 scale-125' : 'hover:scale-110 opacity-60 hover:opacity-100'}`}
                title={`Card ${i + 1}`}
              />
            );
          })}
        </div>

        <div
          onClick={handleFlip}
          className="w-full h-80 relative perspective-1000 cursor-pointer group mt-2"
        >
          <div
            className={`w-full h-full rounded-2xl border border-white/70 dark:border-white/10 bg-white/80 dark:bg-slate-900/85 text-[#241b4b] dark:text-white p-8 shadow-2xl flex flex-col items-center justify-center text-center transition-all duration-500 preserve-3d ${
              flipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front side */}
            <div className={`absolute inset-0 p-8 flex flex-col justify-between backface-hidden ${flipped ? 'opacity-0' : 'opacity-100'}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Front</span>
                <div className="flex gap-2">
                  <Badge color="blue">{currentCard.difficulty}</Badge>
                  <Badge color="purple">{currentCard.category}</Badge>
                </div>
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-semibold text-[#241b4b] dark:text-white my-auto px-4">
                {currentCard.front}
              </p>
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <RotateCw className="h-3 w-3" /> Click card or press Space to flip
              </div>
            </div>

            {/* Back side */}
            <div className={`absolute inset-0 p-8 flex flex-col justify-between backface-hidden rotate-y-180 ${flipped ? 'opacity-100' : 'opacity-0'}`}>
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-brand-300 uppercase tracking-wider">Back</span>
                <div className="flex gap-2">
                  <Badge color="blue">{currentCard.difficulty}</Badge>
                  <Badge color="purple">{currentCard.category}</Badge>
                </div>
              </div>
              <p className="text-base sm:text-lg md:text-xl font-medium text-[#6b6388] dark:text-slate-200 my-auto leading-relaxed px-4">
                {currentCard.back}
              </p>
              <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                <RotateCw className="h-3 w-3" /> Click card or press Space to flip
              </div>
            </div>
          </div>
        </div>

        {/* Study Status Buttons (Only show when flipped) */}
        <div className="h-14 flex items-center justify-center w-full mt-4">
          {flipped ? (
            <div className="flex flex-wrap justify-center gap-3 w-full animate-fade-in">
              <Button onClick={(e) => { e.stopPropagation(); handleMarkStatus('known'); }} variant="ghost" className="border border-success-500/30 text-success-500 hover:bg-success-500/10 flex-1 min-w-[120px] text-xs py-2">
                <Check className="h-3 w-3" /> Known (K)
              </Button>
              <Button onClick={(e) => { e.stopPropagation(); handleMarkStatus('need_review'); }} variant="ghost" className="border border-warning-500/30 text-warning-500 hover:bg-warning-500/10 flex-1 min-w-[120px] text-xs py-2">
                <Clock className="h-3 w-3" /> Need Review (N)
              </Button>
            </div>
          ) : (
             <div className="flex items-center justify-center gap-4 w-full">
               <Button onClick={handlePrev} disabled={currentIdx === 0} variant="secondary" className="w-32 justify-center">
                 <ChevronLeft className="h-4 w-4 mr-1" /> Prev
               </Button>
               <Button onClick={handleFlip} variant="primary" className="w-40 justify-center shadow-lg shadow-brand-500/20">
                 <RotateCw className="h-4 w-4 mr-2" /> Flip Card
               </Button>
               <Button onClick={handleNext} variant="secondary" className="w-32 justify-center">
                 Next <ChevronRight className="h-4 w-4 ml-1" />
               </Button>
             </div>
          )}
        </div>
        
        {/* Show next button if flipped, to allow moving on */}
        {flipped && (
           <div className="flex items-center justify-center gap-4 w-full mt-2">
             <Button onClick={handlePrev} disabled={currentIdx === 0} variant="secondary" className="w-32 justify-center">
               <ChevronLeft className="h-4 w-4 mr-1" /> Prev
             </Button>
             <Button onClick={handleNext} variant="primary" className="w-40 justify-center">
               {currentIdx === stats.total - 1 ? 'Finish' : 'Next Card'} <ChevronRight className="h-4 w-4 ml-1" />
             </Button>
           </div>
        )}

        <div className="text-center text-xs text-gray-500 dark:text-slate-500 font-medium my-2">
          Tip: Space to flip, ← → to move, K/N to mark cards
        </div>

        <div className="w-full mt-4 flex flex-col items-center gap-2">
           <div className="flex items-center justify-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800/30">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>AI-generated flashcards may contain mistakes. Please review with your original study material.</span>
           </div>
           
           {flashcardsData.word_count && (
              <div className="text-xs text-gray-500 dark:text-slate-400">
                 Source Length: {flashcardsData.word_count} words
              </div>
           )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Flashcard Generator"
        subtitle="Generate spaced repetition decks from your extracted notes to enhance active recall."
        icon={Layers}
      />
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-500 animate-pulse">Generating flashcards...</p>
        </div>
      ) : flashcardsData ? (
        renderFlashcards()
      ) : (
        renderSetup()
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Save to My AI Library">
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Title</label>
          <input 
            type="text"
            value={saveTitle} 
            onChange={(e) => setSaveTitle(e.target.value)} 
            placeholder="Enter a title for these flashcards"
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" className="text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleConfirmSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Flashcards;
