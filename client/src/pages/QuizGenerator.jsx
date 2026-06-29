import { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, AlertCircle, RefreshCw, BookOpen, FileText, Trophy, Layers, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import Button from '../components/Button';
import Select from '../components/Select';
import Badge from '../components/Badge';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import Input from '../components/Input';
import { generateQuiz } from '../services/quiz.service';
import { saveQuiz } from '../services/aiLibrary.service';
import { quizAttemptService } from '../services/quizAttempt.service';
import { assessmentService } from '../services/assessment.service';
import { getStudyMaterials } from '../services/studyMaterial.service';
import api from '../services/api';

const cleanOptionText = (option = '') => {
  return String(option)
    .replace(/^(?:\s*(?:Option\s+)?(?:[A-Ea-e][\.\:\-\)]|\([A-Ea-e]\))\s*)+/i, '')
    .trim();
};

const getCorrectAnswerLabel = (question) => {
  const labels = ["A", "B", "C", "D"];
  
  if (!question.correct_answer) return "";

  if (labels.includes(question.correct_answer)) {
    return question.correct_answer;
  }

  const index = question.options?.findIndex(
    option => cleanOptionText(option).toLowerCase().trim() === cleanOptionText(question.correct_answer).toLowerCase().trim()
  );

  return index >= 0 ? labels[index] : question.correct_answer;
};

const showInfoToast = (message) => {
  toast(message, {
    icon: 'ℹ️',
    duration: 3000,
  });
};

const QuizGenerator = () => {
  const navigate = useNavigate();
  const [quizMode, setQuizMode] = useState('practice'); // 'practice' or 'assessment'
  
  const [extractedText, setExtractedText] = useState('');
  const [source, setSource] = useState('pdf');
  
  const [savedSubjects, setSavedSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  
  const [savedMaterials, setSavedMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState('');
  
  const [savedNotes, setSavedNotes] = useState([]);
  const [selectedNoteId, setSelectedNoteId] = useState('');
  const [loadingSources, setLoadingSources] = useState(true);

  const [questionCount, setQuestionCount] = useState('5');
  const [difficulty, setDifficulty] = useState('medium');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');

  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [checkedQuestions, setCheckedQuestions] = useState({});
  const [isAttemptSaved, setIsAttemptSaved] = useState(false);
  const [isSavingAttempt, setIsSavingAttempt] = useState(false);

  const [currentQuizSubjectId, setCurrentQuizSubjectId] = useState(null);
  const [currentQuizSourceTitle, setCurrentQuizSourceTitle] = useState('');
  const [currentQuizNoteId, setCurrentQuizNoteId] = useState(null);
  
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isAssessmentAdded, setIsAssessmentAdded] = useState(false);
  const [isSavingAssessment, setIsSavingAssessment] = useState(false);
  const [assessmentRemainingWeight, setAssessmentRemainingWeight] = useState(100);
  const [assessmentTotalWeight, setAssessmentTotalWeight] = useState(0);
  const [topicStats, setTopicStats] = useState(null);
  const [scoreSourceOption, setScoreSourceOption] = useState('current');
  const [assessmentFormData, setAssessmentFormData] = useState({
    title: '',
    type: 'Quiz',
    mark: '',
    weight: '10',
    assessmentDate: new Date().toISOString().split('T')[0],
    notes: 'Created from saved AI quiz result.'
  });

  useEffect(() => {
    const text = localStorage.getItem('studypulse_extracted_text');
    if (text) setExtractedText(text);

    fetchSources();
  }, []);

  const fetchSources = async () => {
    setLoadingSources(true);
    try {
      const [notesRes, materialsRes, subjectsRes] = await Promise.all([
        api.get('/notes').catch(() => ({ data: [] })),
        getStudyMaterials().catch(() => []),
        api.get('/subjects').catch(() => ({ data: [] }))
      ]);
      
      const normalizeList = (response) => {
        const payload = response?.data ?? response;
        if (Array.isArray(payload)) return payload;
        if (Array.isArray(payload?.data)) return payload.data;
        return [];
      };

      const notes = normalizeList(notesRes);
      const materials = normalizeList(materialsRes);
      const subjects = normalizeList(subjectsRes);
      
      setSavedNotes(notes);
      setSavedMaterials(materials);
      setSavedSubjects(subjects);
      
      let finalNoteId = localStorage.getItem('studypulse_quiz_selected_note_id');
      if (notes.length > 0) {
        const exists = notes.find(n => n.id.toString() === finalNoteId);
        if (!exists) {
          finalNoteId = notes[0].id.toString();
          localStorage.setItem('studypulse_quiz_selected_note_id', finalNoteId);
        }
        setSelectedNoteId(finalNoteId);
      } else if (finalNoteId) {
        localStorage.removeItem('studypulse_quiz_selected_note_id');
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

      const initialSource = localStorage.getItem('studypulse_quiz_source') || 
        (materials.length > 0 || localStorage.getItem('studypulse_extracted_text') ? 'pdf' : 'note');
      
      setSource(initialSource);
      validateQuizState(initialSource, finalMaterialId, finalNoteId);

    } catch (error) {
      console.error('Failed to load sources', error);
      const initialSource = localStorage.getItem('studypulse_quiz_source') || 'pdf';
      validateQuizState(
        initialSource, 
        localStorage.getItem('studypulse_selected_material_id'),
        localStorage.getItem('studypulse_quiz_selected_note_id')
      );
    } finally {
      setLoadingSources(false);
    }
  };

  const validateQuizState = (currentSource, currentMaterialId, currentNoteId) => {
    let currentIdentity = '';
    if (currentSource === 'pdf') {
      currentIdentity = 'pdf_' + (currentMaterialId || localStorage.getItem('studypulse_extracted_text_updated_at') || '');
    } else {
      currentIdentity = 'note_' + (currentNoteId || '');
    }

    const quizSourceUpdatedAt = localStorage.getItem('studypulse_quiz_source_updated_at');

    if (quizSourceUpdatedAt && currentIdentity !== quizSourceUpdatedAt) {
      // Clear old quiz localStorage
      localStorage.removeItem('studypulse_generated_quiz');
      localStorage.removeItem('studypulse_quiz_selected_answers');
      localStorage.removeItem('studypulse_quiz_checked_questions');
      
      setQuizResult(null);
      setSelectedAnswers({});
      setCheckedQuestions({});
    } else {
      // Restore saved quiz
      const savedQuiz = localStorage.getItem('studypulse_generated_quiz');
      if (savedQuiz) {
        try {
          setQuizResult(JSON.parse(savedQuiz));
        } catch (e) {
          console.error("Failed to parse saved quiz", e);
        }
      }

      const savedAnswers = localStorage.getItem('studypulse_quiz_selected_answers');
      if (savedAnswers) {
        try {
          setSelectedAnswers(JSON.parse(savedAnswers));
        } catch (e) {
          console.error("Failed to parse saved answers", e);
        }
      }

      const savedChecked = localStorage.getItem('studypulse_quiz_checked_questions');
      if (savedChecked) {
        try {
          setCheckedQuestions(JSON.parse(savedChecked));
        } catch (e) {
          console.error("Failed to parse checked questions", e);
        }
      }

      setIsAttemptSaved(false);
      setIsAssessmentAdded(false);
    }
  };

  const handleQuizModeChange = (mode) => {
    setQuizMode(mode);
    setQuizResult(null);
    setSelectedAnswers({});
    setCheckedQuestions({});
    setIsAttemptSaved(false);
    setIsAssessmentAdded(false);
    setIsAssessmentModalOpen(false);
  };

  const handleSourceChange = (newSource) => {
    setSource(newSource);
    localStorage.setItem('studypulse_quiz_source', newSource);
    validateQuizState(newSource, selectedMaterialId, selectedNoteId);
  };

  const handleMaterialChange = (newMaterialId) => {
    setSelectedMaterialId(newMaterialId);
    localStorage.setItem('studypulse_selected_material_id', newMaterialId);
    validateQuizState(source, newMaterialId, selectedNoteId);
  };

  const handleNoteChange = (newNoteId) => {
    setSelectedNoteId(newNoteId);
    localStorage.setItem('studypulse_quiz_selected_note_id', newNoteId);
    validateQuizState(source, selectedMaterialId, newNoteId);
  };

  const handleGenerate = async () => {
    let textToUse = '';
    let newIdentity = '';
    
    if (quizMode === 'assessment') {
      if (!selectedSubjectId) {
        toast.error('Please select a subject before generating an assessment quiz.');
        return;
      }
      
      const subjectNotes = savedNotes.filter(n => n.subjectId && n.subjectId.toString() === selectedSubjectId.toString());
      if (subjectNotes.length === 0) {
        toast.error('No Smart Notes found for this subject. Add Smart Notes before generating an assessment quiz.');
        return;
      }
      
      let combined = '';
      subjectNotes.forEach((n, idx) => {
        combined += `Note ${idx + 1}: ${n.title}\n${n.content}\n\n`;
      });
      
      textToUse = combined.substring(0, 15000); // Safely truncate
      newIdentity = 'assessment_' + selectedSubjectId;
      showInfoToast('Using available Smart Notes under this subject to generate the assessment quiz.');
    } else {
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
          toast.error('Please select study material before generating a quiz.');
          return;
        }
        newIdentity = 'note_' + selectedNoteId;
        const note = savedNotes.find(n => n.id.toString() === selectedNoteId.toString());
        if (!note || !note.content || note.content.trim() === '' || note.content === 'Type your notes here...') {
          toast.error('This note does not have enough content to generate a quiz.');
          return;
        }
        textToUse = note.content;
      }
    }

    if (!textToUse) {
      toast.error('Please select study material before generating a quiz.');
      return;
    }
    
    setIsLoading(true);
    setQuizResult(null);
    setSelectedAnswers({});
    setCheckedQuestions({});
    
    localStorage.removeItem('studypulse_generated_quiz');
    localStorage.removeItem('studypulse_quiz_selected_answers');
    localStorage.removeItem('studypulse_quiz_checked_questions');
    
    try {
      const data = await generateQuiz({
        text: textToUse,
        question_count: questionCount,
        difficulty
      });
      setQuizResult(data);
      localStorage.setItem('studypulse_generated_quiz', JSON.stringify(data));
      localStorage.setItem('studypulse_quiz_selected_answers', JSON.stringify({}));
      localStorage.setItem('studypulse_quiz_checked_questions', JSON.stringify({}));

      localStorage.setItem("studypulse_quiz_source_updated_at", newIdentity);
      setIsAttemptSaved(false);
      setIsAssessmentAdded(false);

      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Unable to generate quiz right now. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewQuiz = () => {
    setQuizResult(null);
    setSelectedAnswers({});
    setCheckedQuestions({});
    localStorage.removeItem('studypulse_generated_quiz');
    localStorage.removeItem('studypulse_quiz_selected_answers');
    localStorage.removeItem('studypulse_quiz_checked_questions');
    localStorage.removeItem('studypulse_quiz_source_updated_at');
    setIsAttemptSaved(false);
    setIsAssessmentAdded(false);
  };

  const handleOpenSaveModal = () => {
    setSaveTitle(`Quiz - ${new Date().toLocaleDateString()}`);
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

      await saveQuiz({
        title: saveTitle.trim(),
        sourceType: source,
        sourceTitle,
        questions: quizResult.questions,
        wordCount: quizResult.word_count
      });
      toast.success('Quiz saved to My AI Library.');
      setIsModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save quiz.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setCheckedQuestions({});
    localStorage.setItem('studypulse_quiz_selected_answers', JSON.stringify({}));
    localStorage.setItem('studypulse_quiz_checked_questions', JSON.stringify({}));
    setIsAttemptSaved(false);
    setIsAssessmentAdded(false);
  };

  const handleSelectAnswer = (idx, ans) => {
    setSelectedAnswers(prev => {
      const next = { ...prev, [idx]: ans };
      localStorage.setItem('studypulse_quiz_selected_answers', JSON.stringify(next));
      return next;
    });
  };

  const handleCheckAnswer = (idx, isCorrect) => {
    setCheckedQuestions(prev => {
      const next = { ...prev, [idx]: isCorrect };
      localStorage.setItem('studypulse_quiz_checked_questions', JSON.stringify(next));
      return next;
    });
  };

  const score = Object.keys(checkedQuestions).reduce((acc, index) => {
    if (checkedQuestions[index]) return acc + 1;
    return acc;
  }, 0);
  
  const totalChecked = Object.keys(checkedQuestions).length;
  const isAllChecked = quizResult && totalChecked === quizResult.questions.length;

  const handleSaveQuizResult = async () => {
    if (!isAllChecked) return;
    
    try {
      setIsSavingAttempt(true);
      
      let subjectId = null;
      let finalNoteId = null;
      let sourceTitle = "AI Quiz";
      let finalSourceType = source;

      if (quizMode === 'assessment') {
        subjectId = selectedSubjectId;
        finalNoteId = null;
        finalSourceType = 'assessment_quiz';
        
        const subj = savedSubjects.find(s => s.id.toString() === selectedSubjectId.toString());
        sourceTitle = subj ? `${subj.name || subj.subjectName} Assessment Quiz` : 'Assessment Quiz';
      } else {
        if (source === 'note' && selectedNoteId) {
          const note = savedNotes.find(n => n.id.toString() === selectedNoteId.toString());
          if (note) {
            finalNoteId = note.id;
            subjectId = note.subjectId || null;
            sourceTitle = note.title;
          }
        } else if (source === 'pdf' && selectedMaterialId) {
          const mat = savedMaterials.find(m => m.id.toString() === selectedMaterialId.toString());
          if (mat) {
            sourceTitle = mat.title;
          }
        } else if (source === 'pdf' && extractedText) {
          sourceTitle = "Extracted PDF Material";
        }
      }

      const totalQuestions = quizResult.questions.length;
      const percentage = (score / totalQuestions) * 100;

      const wrongAnswers = [];
      quizResult.questions.forEach((q, idx) => {
        const isCorrect = checkedQuestions[idx];
        if (!isCorrect) {
          wrongAnswers.push({
            question: q.question,
            selectedAnswer: selectedAnswers[idx],
            correctAnswer: cleanOptionText(q.correct_answer || getCorrectAnswerLabel(q)),
            explanation: q.explanation || ""
          });
        }
      });

      const payload = {
        subjectId,
        noteId: finalNoteId ? String(finalNoteId) : null,
        sourceType: finalSourceType,
        sourceTitle,
        difficulty,
        score,
        totalQuestions,
        percentage,
        wrongAnswers
      };

      await quizAttemptService.saveQuizAttempt(payload);
      toast.success('Quiz result saved successfully.');
      setIsAttemptSaved(true);
      setCurrentQuizSubjectId(subjectId);
      setCurrentQuizSourceTitle(sourceTitle);
      setCurrentQuizNoteId(finalNoteId ? String(finalNoteId) : null);
    } catch (error) {
      console.error(error);
      toast.error('Failed to save quiz result.');
    } finally {
      setIsSavingAttempt(false);
    }
  };

  const handleOpenAssessmentModal = async () => {
    if (!currentQuizSubjectId) return;

    let remaining = 100;
    let total = 0;
    try {
      const summaryRes = await assessmentService.getAssessmentSummary(currentQuizSubjectId);
      if (summaryRes && summaryRes.data) {
        remaining = Number(summaryRes.data.remainingWeight || 0);
        total = Number(summaryRes.data.totalWeight || 0);
      }
    } catch (err) {
      console.error("Failed to fetch assessment summary", err);
    }

    setAssessmentRemainingWeight(remaining);
    setAssessmentTotalWeight(total);

    let tStats = null;
    if (currentQuizNoteId) {
      try {
        const statsRes = await quizAttemptService.getTopicQuizAttemptStats(currentQuizNoteId);
        if (statsRes && statsRes.data) {
          tStats = statsRes.data;
        }
      } catch (err) {
        console.error("Failed to fetch topic stats", err);
      }
    }
    
    setTopicStats(tStats);
    setScoreSourceOption('current');

    const totalQuestions = quizResult?.questions?.length || 1;
    const percentage = (score / totalQuestions) * 100;
    
    let defaultWeight = '';
    if (remaining >= 10) defaultWeight = '10';
    else if (remaining > 0) defaultWeight = remaining.toString();

    setAssessmentFormData({
      title: `AI Quiz - ${currentQuizSourceTitle}`,
      type: 'Quiz',
      mark: percentage.toFixed(2),
      weight: defaultWeight,
      assessmentDate: new Date().toISOString().split('T')[0],
      notes: 'Created from saved AI quiz result.\nScore source: This attempt score.'
    });
    setIsAssessmentModalOpen(true);
  };

  const handleAutoAssessmentMark = async () => {
    if (!currentQuizSubjectId) {
      toast.error('Missing subject ID.');
      return;
    }

    const totalQuestions = quizResult?.questions?.length || 1;
    const newMark = Number(((score / totalQuestions) * 100).toFixed(2));

    try {
      const summaryRes = await assessmentService.getAssessmentSummary(currentQuizSubjectId);

      const remaining = Number(
        summaryRes?.data?.remainingWeight ??
        summaryRes?.remainingWeight ??
        100
      );

      const total = Number(
        summaryRes?.data?.totalWeight ??
        summaryRes?.totalWeight ??
        0
      );

      setAssessmentRemainingWeight(remaining);
      setAssessmentTotalWeight(total);

      if (remaining > 0) {
        await handleOpenAssessmentModal();
        return;
      }

      const assessmentsRes = await assessmentService.getAssessmentsBySubject(currentQuizSubjectId);

      const assessmentList =
        assessmentsRes?.data?.assessments ||
        assessmentsRes?.data ||
        assessmentsRes?.assessments ||
        assessmentsRes ||
        [];

      const safeAssessments = Array.isArray(assessmentList) ? assessmentList : [];

      const assessmentQuizTitle = `AI Quiz - ${currentQuizSourceTitle}`;

      const existingAssessmentQuiz =
        safeAssessments.find((assessment) =>
          assessment.type === 'Quiz' &&
          assessment.title === assessmentQuizTitle
        ) ||
        safeAssessments.find((assessment) =>
          assessment.type === 'Quiz' &&
          assessment.title?.toLowerCase().includes('assessment quiz')
        );

      if (!existingAssessmentQuiz) {
        toast.error('This subject already has 100% assessment weight. No AI Assessment Quiz record was found to update.');
        return;
      }

      const oldMark = Number(existingAssessmentQuiz.mark);

      if (Number.isNaN(newMark) || newMark < 0 || newMark > 100) {
        toast.error('Assessment mark must be between 0 and 100.');
        return;
      }

      if (newMark <= oldMark) {
        toast(
          `Your saved assessment quiz mark is already ${oldMark}%. This new quiz score is ${newMark}%, so no update is needed.`,
          {
            icon: 'ℹ️',
            duration: 4000,
          }
        );
        return;
      }

      const updatedNotes = `${existingAssessmentQuiz.notes || ''}

Updated from AI Assessment Quiz.
Previous mark: ${oldMark}%.
New mark: ${newMark}%.
Rule: Highest quiz mark kept.
Updated on: ${new Date().toLocaleDateString()}`;

      await assessmentService.updateAssessment(existingAssessmentQuiz.id, {
        subjectId: currentQuizSubjectId,
        title: existingAssessmentQuiz.title,
        type: existingAssessmentQuiz.type,
        mark: newMark,
        weight: Number(existingAssessmentQuiz.weight),
        assessmentDate:
          existingAssessmentQuiz.assessmentDate ||
          existingAssessmentQuiz.date ||
          null,
        notes: updatedNotes,
      });

      toast.success(`Assessment quiz mark updated from ${oldMark}% to ${newMark}%.`);
      setIsAssessmentAdded(true);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to update assessment mark.');
    }
  };

  const handleScoreSourceChange = (option) => {
    setScoreSourceOption(option);
    
    const totalQuestions = quizResult?.questions?.length || 1;
    let newMark = (score / totalQuestions) * 100;
    let sourceText = 'This attempt score.';

    if (option === 'best' && topicStats) {
      newMark = topicStats.bestScore;
      sourceText = 'Best topic score.';
    } else if (option === 'average' && topicStats) {
      newMark = topicStats.averageScore;
      sourceText = 'Average topic score.';
    } else if (option === 'latest' && topicStats) {
      newMark = topicStats.latestScore;
      sourceText = 'Latest topic score.';
    }

    setAssessmentFormData(prev => ({
      ...prev,
      mark: newMark.toFixed(2),
      notes: `Created from saved AI quiz result.\nScore source: ${sourceText}`
    }));
  };

  const handleSaveAssessment = async (e) => {
    e.preventDefault();
    if (!currentQuizSubjectId) return toast.error('Missing subject ID.');
    
    const weightVal = Number(assessmentFormData.weight);
    const markVal = Number(assessmentFormData.mark);
    
    if (!assessmentFormData.title.trim()) return toast.error('Assessment Title is required.');
    if (!assessmentFormData.weight) return toast.error('Please enter assessment weight.');
    if (isNaN(weightVal) || weightVal <= 0 || weightVal > 100) return toast.error('Assessment weight must be between 1 and 100.');
    if (weightVal > assessmentRemainingWeight) return toast.error('Assessment weight cannot exceed remaining weight.');
    if (isNaN(markVal) || markVal < 0 || markVal > 100) return toast.error('Assessment mark must be between 0 and 100.');

    try {
      setIsSavingAssessment(true);
      await assessmentService.createAssessment({
        subjectId: currentQuizSubjectId,
        title: assessmentFormData.title.trim(),
        type: assessmentFormData.type,
        mark: markVal,
        weight: weightVal,
        assessmentDate: assessmentFormData.assessmentDate || null,
        notes: assessmentFormData.notes
      });
      toast.success('Quiz result added to Assessment Tracker.');
      setIsAssessmentAdded(true);
      setIsAssessmentModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to Assessment Tracker');
    } finally {
      setIsSavingAssessment(false);
    }
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
          description="Upload a PDF or create a Smart Note first to generate a quiz based on its contents."
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
            <HelpCircle className="h-8 w-8 text-brand-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">Quiz Setup</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
            Configure how you want your quiz generated from your study material.
          </p>
        </div>

        <div className="space-y-6">
          
          <div className="space-y-3">
            <label className="text-sm font-bold text-slate-700 dark:text-slate-200">Quiz Mode</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                onClick={() => handleQuizModeChange('practice')}
                className={`cursor-pointer border p-4 rounded-xl transition-all ${quizMode === 'practice' ? 'border-cyan-400 dark:border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded-full border-[4px] ${quizMode === 'practice' ? 'border-cyan-500 bg-white' : 'border-slate-300 dark:border-slate-600 bg-transparent'}`}></div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Practice Quiz</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
                  Generate quizzes from a selected Smart Note for revision and weak topic detection.
                </p>
              </div>

              <div 
                onClick={() => handleQuizModeChange('assessment')}
                className={`cursor-pointer border p-4 rounded-xl transition-all ${quizMode === 'assessment' ? 'border-cyan-400 dark:border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40 shadow-sm' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-4 h-4 rounded-full border-[4px] ${quizMode === 'assessment' ? 'border-cyan-500 bg-white' : 'border-slate-300 dark:border-slate-600 bg-transparent'}`}></div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Assessment Quiz</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pl-6 leading-relaxed">
                  Generate a subject-level quiz that can be added to your Assessment Tracker.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6 space-y-4">
            
            {quizMode === 'practice' ? (
              <div className="space-y-1">
                <Select
                  label="Study Source"
                  value={source}
                  onChange={(e) => handleSourceChange(e.target.value)}
                  options={sourceOptions}
                />
              </div>
            ) : (
              <div className="space-y-1">
                <Select
                  label="Select Subject"
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  options={[
                    { value: '', label: 'Select a subject...' },
                    ...savedSubjects.map(s => ({
                      label: s.name || s.subjectName,
                      value: s.id.toString()
                    }))
                  ]}
                />
              </div>
            )}

            {quizMode === 'practice' && source === 'pdf' && safeMaterials.length > 0 && (
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
            {quizMode === 'practice' && source === 'pdf' && safeMaterials.length === 0 && extractedText && (
               <p className="text-[11px] text-brand-400 font-medium px-2">Using extracted PDF text from your last uploaded material.</p>
            )}
            {quizMode === 'practice' && source === 'pdf' && safeMaterials.length === 0 && !extractedText && (
               <p className="text-[11px] text-brand-400 font-medium px-2">No saved PDF materials found. Upload a PDF first.</p>
            )}

            {quizMode === 'practice' && source === 'note' && (
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
                <p className="text-[11px] text-brand-400 font-medium px-2">Choose one of your saved Smart Notes to create a quiz.</p>
              </div>
            )}

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <Select
              label="Number of Questions"
              value={questionCount}
              onChange={(e) => setQuestionCount(e.target.value)}
              options={[
                { value: '3', label: '3 Questions (Quick)' },
                { value: '5', label: '5 Questions (Medium)' },
                { value: '10', label: '10 Questions (Complete)' },
              ]}
            />
            <Select
              label="Difficulty Level"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              options={[
                { value: 'easy', label: 'Easy' },
                { value: 'medium', label: 'Medium' },
                { value: 'hard', label: 'Hard' },
              ]}
            />
          </div>

            <Button
              onClick={handleGenerate}
              disabled={isLoading}
              className="w-full mt-4"
              variant="primary"
            >
              {isLoading ? <LoadingSpinner size="sm" /> : 'Generate Quiz'}
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Quiz Generator"
        subtitle="Generate adaptive quizzes directly from your study material."
        icon={HelpCircle}
      />

      <div className="max-w-3xl mx-auto space-y-6">
        {!quizResult && !isLoading && renderSetup()}

        {isLoading && (
          <div className="glass-card p-12 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 shadow-sm flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">
              Analyzing text and generating quiz...
            </p>
          </div>
        )}

        {quizResult && !isLoading && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 glass-card p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shadow-sm">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-brand-500" />
                  <h3 className="font-bold text-slate-800 dark:text-white">Interactive Quiz</h3>
                </div>
                <div className="text-sm font-bold text-brand-600 dark:text-brand-400">
                  Score: {score} / {quizResult.questions.length}
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="h-3.5 w-3.5" />
                  {quizResult.word_count} words
                </span>
                <Button variant="secondary" onClick={handleResetQuiz} className="h-7 text-xs px-3">
                  <RefreshCw className="h-3 w-3 mr-1" /> Reset Quiz
                </Button>
                <Button variant="secondary" onClick={handleNewQuiz} className="h-7 text-xs px-3">
                  <Sparkles className="h-3 w-3 mr-1" /> New Quiz
                </Button>
                <Button 
                  onClick={handleOpenSaveModal} 
                  disabled={isSaving} 
                  variant="primary" 
                  className="h-7 text-xs px-3"
                >
                  <Save className="h-3 w-3 mr-1" /> Save Quiz to Library
                </Button>
                <Button 
                  onClick={handleSaveQuizResult} 
                  disabled={!isAllChecked || isAttemptSaved || isSavingAttempt} 
                  className={`h-7 text-xs px-3 font-bold ${isAttemptSaved ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-300' : 'bg-cyan-500 hover:bg-cyan-600 text-white'}`}
                >
                  <Trophy className="h-3 w-3 mr-1" /> 
                  {isAttemptSaved ? 'Quiz Result Saved' : isSavingAttempt ? 'Saving...' : 'Save Quiz Result'}
                </Button>
                {quizMode === 'assessment' && (
                  <Button
                    onClick={handleAutoAssessmentMark}
                    disabled={!isAttemptSaved || isAssessmentAdded || !currentQuizSubjectId}
                    className={`h-7 text-xs px-3 font-bold ${
                      isAssessmentAdded
                        ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-300'
                        : !isAttemptSaved || !currentQuizSubjectId
                          ? 'bg-slate-200 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-300'
                          : 'bg-cyan-500 hover:bg-cyan-600 text-white'
                    }`}
                  >
                    <Layers className="h-3 w-3 mr-1" />
                    {isAssessmentAdded
                      ? 'Assessment Updated'
                      : !isAttemptSaved
                        ? 'Save Result First'
                        : 'Add Assessment Mark'}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-6">
              {quizResult.questions.map((q, idx) => (
                <QuestionCard 
                  key={idx} 
                  question={q} 
                  index={idx}
                  selectedAnswer={selectedAnswers[idx]}
                  isChecked={checkedQuestions[idx] !== undefined}
                  isCorrect={checkedQuestions[idx]}
                  onSelect={(ans) => handleSelectAnswer(idx, ans)}
                  onCheck={(isCorrect) => handleCheckAnswer(idx, isCorrect)}
                />
              ))}
            </div>

            {/* Disclaimer */}
            <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">
                Note: AI-generated quizzes may contain mistakes. Please review with your original study material.
              </p>
            </div>

            {isAttemptSaved && (
              <div className="mt-6 p-5 rounded-xl border border-purple-100 dark:border-slate-700 bg-white/80 dark:bg-slate-900/70 shadow-sm">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-white mb-1">
                    Your quiz result has been saved for analytics.
                  </h4>

                  {quizMode === 'practice' ? (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      This practice quiz will be used for topic analytics and Weak Topic Radar.
                    </p>
                  ) : (
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      This assessment quiz result is ready. Use the Add Assessment Mark button above if it should count toward your subject mark.
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Save to AI Library Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Save to My AI Library">
        <div className="space-y-4">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Title</label>
          <input 
            type="text"
            value={saveTitle} 
            onChange={(e) => setSaveTitle(e.target.value)} 
            placeholder="Enter a title for this quiz"
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

      {/* Assessment Tracker Modal */}
      <Modal open={isAssessmentModalOpen} onClose={() => setIsAssessmentModalOpen(false)} title="Add to Assessment Tracker">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
            Remaining Weight: {assessmentRemainingWeight}%
          </span>
        </div>
        {assessmentRemainingWeight === 0 && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 font-medium text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>This subject already has 100% assessment weight. Please edit existing weights before adding this quiz.</p>
          </div>
        )}
        {assessmentTotalWeight > 100 && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-600 dark:text-red-400 font-medium text-sm flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>This subject already exceeds 100% assessment weight. Please fix existing weights before adding this quiz.</p>
          </div>
        )}

        <form onSubmit={handleSaveAssessment} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Assessment Title</label>
            <input 
              required
              type="text"
              value={assessmentFormData.title}
              onChange={(e) => setAssessmentFormData({...assessmentFormData, title: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Type</label>
              <select 
                value={assessmentFormData.type}
                onChange={(e) => setAssessmentFormData({...assessmentFormData, type: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
              >
                <option value="Quiz">Quiz</option>
                <option value="Assignment">Assignment</option>
                <option value="Mid Exam">Mid Exam</option>
                <option value="Final Exam">Final Exam</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Date (Optional)</label>
              <input 
                type="date"
                value={assessmentFormData.assessmentDate}
                onChange={(e) => setAssessmentFormData({...assessmentFormData, assessmentDate: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
              />
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200 mb-3 block">Choose Mark Source</label>
            {!topicStats ? (
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full border-[5px] border-cyan-500 bg-white"></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">This attempt score: {((score / (quizResult?.questions?.length || 1)) * 100).toFixed(2)}%</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 ml-7">
                  {quizMode === 'assessment' 
                    ? 'Assessment Quizzes are subject-level, so only this attempt score is used.' 
                    : 'Topic-level best and average scores are available only for Smart Note quizzes.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`cursor-pointer p-3 border rounded-xl flex items-start gap-3 transition-colors ${scoreSourceOption === 'current' ? 'border-cyan-400 dark:border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <input type="radio" name="scoreSource" value="current" checked={scoreSourceOption === 'current'} onChange={() => handleScoreSourceChange('current')} className="mt-1 accent-cyan-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">This attempt score</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{((score / (quizResult?.questions?.length || 1)) * 100).toFixed(2)}%</p>
                  </div>
                </label>
                
                <label className={`cursor-pointer p-3 border rounded-xl flex items-start gap-3 transition-colors ${scoreSourceOption === 'best' ? 'border-cyan-400 dark:border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <input type="radio" name="scoreSource" value="best" checked={scoreSourceOption === 'best'} onChange={() => handleScoreSourceChange('best')} className="mt-1 accent-cyan-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Best topic score</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{topicStats.bestScore}%</p>
                  </div>
                </label>
                
                <label className={`cursor-pointer p-3 border rounded-xl flex items-start gap-3 transition-colors ${scoreSourceOption === 'average' ? 'border-cyan-400 dark:border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <input type="radio" name="scoreSource" value="average" checked={scoreSourceOption === 'average'} onChange={() => handleScoreSourceChange('average')} className="mt-1 accent-cyan-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Average topic score</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{topicStats.averageScore}%</p>
                  </div>
                </label>

                <label className={`cursor-pointer p-3 border rounded-xl flex items-start gap-3 transition-colors ${scoreSourceOption === 'latest' ? 'border-cyan-400 dark:border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <input type="radio" name="scoreSource" value="latest" checked={scoreSourceOption === 'latest'} onChange={() => handleScoreSourceChange('latest')} className="mt-1 accent-cyan-500" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Latest topic score</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{topicStats.latestScore}%</p>
                  </div>
                </label>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Mark (%)</label>
              <input 
                required
                type="number"
                step="0.01"
                min="0" max="100"
                value={assessmentFormData.mark}
                onChange={(e) => setAssessmentFormData({...assessmentFormData, mark: e.target.value})}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Weight (%) <span className="text-slate-500 font-normal ml-1">e.g. 10</span>
              </label>
              <input 
                required
                type="number"
                step="0.01"
                min="0.01" max="100"
                value={assessmentFormData.weight}
                onChange={(e) => setAssessmentFormData({...assessmentFormData, weight: e.target.value})}
                disabled={assessmentRemainingWeight === 0}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white disabled:opacity-50"
              />
              <p className="text-[10px] text-slate-500 mt-1">Example: Use 5 or 10 if this quiz is a small assessment.</p>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-200">Notes</label>
            <textarea 
              rows={2}
              value={assessmentFormData.notes}
              onChange={(e) => setAssessmentFormData({...assessmentFormData, notes: e.target.value})}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-slate-900 dark:text-white"
            />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <Button type="button" variant="ghost" className="text-slate-700 dark:text-slate-200" onClick={() => setIsAssessmentModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary" 
              disabled={isSavingAssessment || assessmentRemainingWeight === 0} 
              className={`bg-cyan-500 hover:bg-cyan-600 text-white ${assessmentRemainingWeight === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isSavingAssessment ? 'Saving...' : 'Add Assessment'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const QuestionCard = ({ question, index, selectedAnswer, isChecked, isCorrect, onSelect, onCheck }) => {
  const [showAnswer, setShowAnswer] = useState(false);
  const labels = ["A", "B", "C", "D"];
  const correctLabel = getCorrectAnswerLabel(question);

  useEffect(() => {
    if (!isChecked && !selectedAnswer) {
      setShowAnswer(false);
    }
  }, [isChecked, selectedAnswer]);

  const handleCheck = () => {
    if (!selectedAnswer) return;
    const isAnsCorrect = selectedAnswer === correctLabel;
    onCheck(isAnsCorrect);
  };

  return (
    <div className="glass-card p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg">
      <div className="flex items-center gap-2 mb-4">
        <Badge color="purple">Question {index + 1}</Badge>
        {question.type === 'mcq' ? (
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Multiple Choice</span>
        ) : (
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Short Answer</span>
        )}
      </div>
      
      <h4 className="font-bold text-slate-800 dark:text-white mb-4 text-base">
        {question.question}
      </h4>

      {question.type === 'mcq' && question.options && question.options.length > 0 && (
        <div className="space-y-2 mb-6">
          {question.options.map((opt, i) => {
            const label = labels[i];
            const isSelected = selectedAnswer === label;
            
            let borderClass = "border-slate-200 bg-slate-50 hover:bg-slate-100 dark:border-slate-600/50 dark:bg-slate-900/40 dark:hover:bg-slate-800/70";
            let textClass = "text-slate-700 dark:text-slate-100 font-medium";
            let labelClass = "font-bold text-brand-600 dark:text-brand-300 mr-3";

            if (isChecked) {
              if (label === correctLabel) {
                borderClass = "border-success-400 bg-success-50 dark:border-success-400 dark:bg-success-500/20";
                textClass = "text-success-800 dark:text-success-100 font-medium";
                labelClass = "font-bold text-success-600 dark:text-success-300 mr-3";
              } else if (isSelected && label !== correctLabel) {
                borderClass = "border-red-400 bg-red-50 dark:border-red-400 dark:bg-red-500/20";
                textClass = "text-red-800 dark:text-red-100 font-medium";
                labelClass = "font-bold text-red-600 dark:text-red-300 mr-3";
              } else {
                borderClass = "border-slate-200 bg-slate-50 dark:border-slate-600/30 dark:bg-slate-900/20";
                textClass = "text-slate-500 dark:text-slate-300 font-medium";
                labelClass = "font-bold text-slate-400 dark:text-slate-400 mr-3";
              }
            } else {
              if (isSelected) {
                borderClass = "border-brand-400 bg-brand-50 dark:border-brand-400 dark:bg-brand-500/20 ring-1 ring-brand-400";
                textClass = "text-brand-900 dark:text-slate-100 font-medium";
              }
            }

            return (
              <button 
                key={i} 
                onClick={() => !isChecked && onSelect(label)}
                disabled={isChecked}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 cursor-pointer disabled:cursor-default flex items-start ${borderClass}`}
              >
                <span className={labelClass}>{label}.</span>
                <span className={textClass}>{cleanOptionText(opt)}</span>
              </button>
            );
          })}
        </div>
      )}

      {question.type === 'mcq' ? (
        !isChecked ? (
          <Button onClick={handleCheck} disabled={!selectedAnswer} className="w-full justify-center">
            Check Answer
          </Button>
        ) : (
          <div className={`mt-4 p-4 rounded-xl border ${isCorrect ? 'bg-success-50 border-success-200 dark:bg-success-500/10 dark:border-success-500/20' : 'bg-red-50 border-red-200 dark:bg-red-500/10 dark:border-red-500/20'}`}>
            <div className="mb-2">
              <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${isCorrect ? 'text-success-700 dark:text-success-400' : 'text-red-700 dark:text-red-400'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect.'}
              </span>
              {!isCorrect && (
                <p className="text-sm font-semibold text-slate-800 dark:text-white">
                  Correct answer is {correctLabel}. {cleanOptionText(question.options[labels.indexOf(correctLabel)] || question.correct_answer)}
                </p>
              )}
            </div>
            {question.explanation && (
              <div className={`mt-3 pt-3 border-t ${isCorrect ? 'border-success-200 dark:border-success-500/20' : 'border-red-200 dark:border-red-500/20'}`}>
                <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${isCorrect ? 'text-success-700 dark:text-success-400' : 'text-red-700 dark:text-red-400'}`}>Explanation</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{question.explanation}</p>
              </div>
            )}
          </div>
        )
      ) : (
        !showAnswer ? (
          <Button variant="secondary" onClick={() => setShowAnswer(true)} className="w-full justify-center">
            Show Answer
          </Button>
        ) : (
          <div className="mt-4 p-4 rounded-xl bg-success-50 dark:bg-success-500/10 border border-success-200 dark:border-success-500/20">
            <div className="mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-success-700 dark:text-success-400 block mb-1">Correct Answer</span>
              <p className="text-sm font-semibold text-slate-800 dark:text-white">{question.correct_answer}</p>
            </div>
            {question.explanation && (
              <div className="mt-3 pt-3 border-t border-success-200 dark:border-success-500/20">
                <span className="text-xs font-bold uppercase tracking-wider text-success-700 dark:text-success-400 block mb-1">Explanation</span>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{question.explanation}</p>
              </div>
            )}
          </div>
        )
      )}
    </div>
  );
};

export default QuizGenerator;
