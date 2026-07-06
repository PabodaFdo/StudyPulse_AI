import { useState, useEffect } from 'react';
import { FileText, Sparkles, AlertCircle, BookOpen, BrainCircuit, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Select from '../components/Select';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { generateSummary } from '../services/summary.service';
import { saveSummary } from '../services/aiLibrary.service';
import { getStudyMaterials } from '../services/studyMaterial.service';
import { saveSummaryReviewAttempt } from '../services/summaryReview.service';
import { CheckCircle } from 'lucide-react';
import api from '../services/api';

const GenerateSummary = () => {
  const navigate = useNavigate();
  const [extractedText, setExtractedText] = useState('');
  const [source, setSource] = useState('pdf');
  
  const [savedMaterials, setSavedMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  
  const [savedNotes, setSavedNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  
  const [loadingSources, setLoadingSources] = useState(true);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [summaryResult, setSummaryResult] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');

  const [readStartTime, setReadStartTime] = useState(null);
  const [isReviewMarked, setIsReviewMarked] = useState(false);
  const [isMarkingReview, setIsMarkingReview] = useState(false);

  useEffect(() => {
    const text = localStorage.getItem('studypulse_extracted_text');
    if (text) setExtractedText(text);

    fetchSources();
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
      
      let finalNoteId = localStorage.getItem('studypulse_summary_selected_note_id');
      if (notes.length > 0) {
        const exists = notes.find(n => n.id.toString() === finalNoteId);
        if (!exists) {
          finalNoteId = notes[0].id.toString();
          localStorage.setItem('studypulse_summary_selected_note_id', finalNoteId);
        }
        setSelectedNoteId(finalNoteId);
      } else if (finalNoteId) {
        localStorage.removeItem('studypulse_summary_selected_note_id');
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

      const initialSource = localStorage.getItem('studypulse_summary_source') || 
        (materials.length > 0 || localStorage.getItem('studypulse_extracted_text') ? 'pdf' : 'note');
      
      setSource(initialSource);
      validateSummaryState(initialSource, finalMaterialId, finalNoteId);

    } catch (error) {
      console.error('Failed to load sources', error);
    } finally {
      setLoadingSources(false);
    }
  };

  const validateSummaryState = (currentSource, currentMaterialId, currentNoteId) => {
    let currentIdentity = '';
    if (currentSource === 'pdf') {
      currentIdentity = 'pdf_' + (currentMaterialId || localStorage.getItem('studypulse_extracted_text_updated_at') || '');
    } else {
      currentIdentity = 'note_' + (currentNoteId || '');
    }

    const summarySourceId = localStorage.getItem('studypulse_summary_source_id');

    if (summarySourceId && currentIdentity !== summarySourceId) {
      localStorage.removeItem('studypulse_generated_summary');
      setSummaryResult(null);
    } else {
      const savedSummary = localStorage.getItem('studypulse_generated_summary');
      if (savedSummary) {
        try {
          setSummaryResult(JSON.parse(savedSummary));
        } catch (e) {
          console.error("Failed to parse saved summary", e);
        }
      }
    }
  };

  const handleSourceChange = (newSource) => {
    setSource(newSource);
    localStorage.setItem('studypulse_summary_source', newSource);
    validateSummaryState(newSource, selectedMaterialId, selectedNoteId);
  };

  const handleMaterialChange = (newMaterialId) => {
    setSelectedMaterialId(newMaterialId);
    localStorage.setItem('studypulse_selected_material_id', newMaterialId);
    validateSummaryState(source, newMaterialId, selectedNoteId);
  };

  const handleNoteChange = (newNoteId) => {
    setSelectedNoteId(newNoteId);
    localStorage.setItem('studypulse_summary_selected_note_id', newNoteId);
    validateSummaryState(source, selectedMaterialId, newNoteId);
  };

  const handleGenerateSummary = async () => {
    let textToUse = '';
    let newIdentity = '';
    
    if (source === 'pdf') {
      if (selectedMaterialId) {
        const material = savedMaterials.find(m => m.id.toString() === selectedMaterialId.toString());
        if (material) {
          textToUse = material.extractedText;
          newIdentity = 'pdf_' + material.id;
        }
      }
      
      if (!textToUse && extractedText) {
        textToUse = extractedText;
        newIdentity = 'pdf_' + (localStorage.getItem('studypulse_extracted_text_updated_at') || '');
      }

      if (!textToUse) {
        toast.error('No PDF text found. Please upload a PDF first.');
        return;
      }
    } else if (source === 'note') {
      if (!selectedNoteId) {
        toast.error('Please select a note.');
        return;
      }
      newIdentity = 'note_' + selectedNoteId;
      const note = savedNotes.find(n => n.id.toString() === selectedNoteId.toString());
      if (!note || !note.content || note.content.trim() === '') {
        toast.error('This note is empty.');
        return;
      }
      textToUse = note.content;
    }

    setIsGenerating(true);
    setSummaryResult(null);
    localStorage.removeItem('studypulse_generated_summary');

    try {
      const data = await generateSummary(textToUse);
      setSummaryResult(data);
      localStorage.setItem('studypulse_generated_summary', JSON.stringify(data));
      localStorage.setItem("studypulse_summary_source_id", newIdentity);

      setReadStartTime(Date.now());
      setIsReviewMarked(false);

      toast.success('Summary generated successfully!');
    } catch (error) {
      console.error('Summary Generation Error:', error);
      toast.error('Unable to generate summary right now. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenSaveModal = () => {
    setSaveTitle(`Summary - ${new Date().toLocaleDateString()}`);
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

      await saveSummary({
        title: saveTitle.trim(),
        sourceType: source,
        sourceTitle,
        content: {
          main_summary: summaryResult.main_summary,
          important_points: summaryResult.important_points,
          key_terms: summaryResult.key_terms,
          section_summaries: summaryResult.section_summaries
        },
        wordCount: summaryResult.word_count
      });
      toast.success('Summary saved to My AI Library.');
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save summary.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkReviewed = async () => {
    if (isReviewMarked || isMarkingReview) return;
    try {
      setIsMarkingReview(true);
      let subjectId = null;
      let sourceTitle = "Extracted PDF Material";
      if (source === 'note') {
        const note = savedNotes.find(n => n.id.toString() === selectedNoteId.toString());
        if (note) {
          sourceTitle = note.title;
          subjectId = note.subjectId || (note.subject && note.subject.id) || null;
        }
      } else if (selectedMaterialId) {
        const mat = savedMaterials.find(m => m.id.toString() === selectedMaterialId.toString());
        if (mat) {
          sourceTitle = mat.title;
          subjectId = mat.subjectId || (mat.subject && mat.subject.id) || null;
        }
      }

      const duration = readStartTime ? Math.floor((Date.now() - readStartTime) / 1000) : 0;
      
      await saveSummaryReviewAttempt({
        subjectId,
        sourceTitle,
        summaryWordCount: summaryResult.word_count || 0,
        readDurationSeconds: duration,
        completed: true
      });
      
      setIsReviewMarked(true);
      toast.success('Summary marked as reviewed!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to mark summary as reviewed.');
    } finally {
      setIsMarkingReview(false);
    }
  };

  const handleNewSummary = () => {
    setSummaryResult(null);
    localStorage.removeItem('studypulse_generated_summary');
    localStorage.removeItem('studypulse_summary_source_id');
  };

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
          icon={BookOpen}
          title="No study material found"
          description="Upload a PDF or create a Smart Note first to generate a summary."
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

    const sourceOptions = [];
    if (extractedText || safeMaterials.length > 0) sourceOptions.push({ label: 'Saved PDF Material', value: 'pdf' });
    if (safeNotes.length > 0) sourceOptions.push({ label: 'Saved Smart Note', value: 'note' });

    return (
      <div className="glass-card max-w-xl mx-auto p-6 md:p-8 space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-brand-500/10 mb-4">
            <BookOpen className="h-8 w-8 text-brand-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Summary Setup</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            Choose your source material to generate a comprehensive AI summary.
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
                  label: `${n.title} — ${n.subject?.name || 'Unknown'}`,
                  value: n.id.toString()
                }))}
              />
            </div>
          )}

          <Button
            onClick={handleGenerateSummary}
            disabled={isGenerating}
            className="w-full mt-4"
            variant="primary"
          >
            {isGenerating ? <LoadingSpinner size="sm" /> : 'Generate Summary'}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Generate AI Summary"
        subtitle="Transform your notes or PDFs into a condensed, easy-to-read study summary."
        icon={BrainCircuit}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {!summaryResult && !isGenerating && renderSetup()}

        {isGenerating && (
          <div className="glass-card p-12 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
              Analyzing text and generating summary...
            </p>
          </div>
        )}

        {summaryResult && !isGenerating && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Badges */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-brand-500" />
                <h3 className="font-bold text-slate-800 dark:text-white">AI Summary Results</h3>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {summaryResult.word_count} words
                </span>
                <Button variant="secondary" onClick={handleNewSummary} className="h-7 text-xs px-3">
                  <Sparkles className="h-3 w-3 mr-1" /> New Summary
                </Button>
                <button 
                  onClick={handleOpenSaveModal} 
                  disabled={isSaving} 
                  className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold transition flex items-center gap-1.5 text-xs shadow-md"
                >
                  <Save className="h-3.5 w-3.5" /> 
                  {isSaving ? 'Saving...' : 'Save Summary'}
                </button>
              </div>
            </div>

            {/* Important Study Points */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
              <h4 className="font-bold text-brand-600 dark:text-brand-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Sparkles className="h-4 w-4" /> Important Study Points
              </h4>
              <ul className="space-y-3">
                {summaryResult.important_points?.map((point, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                      {index + 1}
                    </span>
                    <span className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Main Summary */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
              <h4 className="font-bold text-slate-800 dark:text-white mb-3 text-lg">
                Main Summary
              </h4>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                {summaryResult.main_summary}
              </p>
            </div>

            {/* Section Summaries */}
            {summaryResult.section_summaries && summaryResult.section_summaries.length > 0 && (
              <div className="space-y-4">
                <h4 className="font-bold text-brand-600 dark:text-brand-400 flex items-center gap-2 text-sm uppercase tracking-wider px-2">
                  <BookOpen className="h-4 w-4" /> Section Summaries
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  {summaryResult.section_summaries.map((section, index) => (
                    <div key={index} className="glass-card p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm flex flex-col h-full">
                      <h5 className="font-bold text-slate-800 dark:text-white mb-2 text-md">
                        {section.section_title}
                      </h5>
                      <p className="text-slate-600 dark:text-slate-300 text-xs leading-relaxed whitespace-pre-wrap flex-grow mb-3">
                        {section.section_summary}
                      </p>
                      {section.important_points && section.important_points.length > 0 && (
                        <div className="mt-auto pt-3 border-t border-slate-200 dark:border-slate-800">
                          <ul className="space-y-1.5">
                            {section.important_points.map((point, pIndex) => (
                              <li key={pIndex} className="flex items-start gap-2">
                                <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-[9px] font-bold text-brand-700 dark:text-brand-300">
                                  {pIndex + 1}
                                </span>
                                <span className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Terms */}
            {summaryResult.key_terms && summaryResult.key_terms.length > 0 && (
              <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm">
                <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-wider">
                  Key Terms
                </h4>
                <div className="flex flex-wrap gap-2">
                  {summaryResult.key_terms.map((term, index) => (
                    <span key={index} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700">
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Mark as Reviewed Action */}
            <div className="flex justify-center mt-6">
              <Button
                variant={isReviewMarked ? 'secondary' : 'primary'}
                onClick={handleMarkReviewed}
                disabled={isReviewMarked || isMarkingReview}
                className="w-full sm:w-auto px-8 py-3 rounded-full flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <CheckCircle className={`h-5 w-5 ${isReviewMarked ? 'text-brand-500' : ''}`} />
                {isReviewMarked ? 'Review Completed' : isMarkingReview ? 'Marking...' : 'Mark as Reviewed'}
              </Button>
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                Note: AI can make mistakes. Please review the summary with your original study material.
              </p>
            </div>

          </div>
        )}
      </div>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Save to My AI Library">
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Title</label>
          <input 
            type="text"
            value={saveTitle} 
            onChange={(e) => setSaveTitle(e.target.value)} 
            placeholder="Enter a title for this summary"
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

export default GenerateSummary;
