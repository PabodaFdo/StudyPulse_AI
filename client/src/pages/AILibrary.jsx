import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
  Library,
  FileText,
  HelpCircle,
  Layers,
  File,
  Eye,
  Trash2,
  Calendar,
  Search,
  BookOpen,
  Filter,
  X,
  CheckCircle
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import Button from '../components/Button';
import Modal from '../components/Modal';
import {
  getSavedSummaries,
  getSavedQuizzes,
  getSavedFlashcards,
  deleteSavedSummary,
  deleteSavedQuiz,
  deleteSavedFlashcards
} from '../services/aiLibrary.service';
import { getStudyMaterials, deleteStudyMaterial } from '../services/studyMaterial.service';
import { saveSummaryReviewAttempt } from '../services/summaryReview.service';

const TABS = [
  { id: 'summaries', label: 'Summaries', icon: FileText },
  { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
  { id: 'flashcards', label: 'Flashcards', icon: Layers },
  { id: 'materials', label: 'PDF Materials', icon: File },
];

const normalizeList = (response) => {
  const payload = response?.data ?? response;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

const toSearchableText = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map(toSearchableText).join(" ");
  if (typeof value === "object") return Object.values(value).map(toSearchableText).join(" ");
  return String(value);
};

const isWithinDateFilter = (dateValue, filter) => {
  if (!dateValue || filter === "all") return true;

  const itemDate = new Date(dateValue);
  const now = new Date();

  if (filter === "today") {
    return itemDate.toDateString() === now.toDateString();
  }

  if (filter === "last7") {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    return itemDate >= sevenDaysAgo;
  }

  if (filter === "last30") {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    return itemDate >= thirtyDaysAgo;
  }

  if (filter === "thisMonth") {
    return (
      itemDate.getMonth() === now.getMonth() &&
      itemDate.getFullYear() === now.getFullYear()
    );
  }

  return true;
};

const AILibrary = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const validTabs = ["summaries", "quizzes", "flashcards", "materials"];
  const tabFromUrl = searchParams.get("tab");

  const [activeTab, setActiveTab] = useState(
    validTabs.includes(tabFromUrl) ? tabFromUrl : 'summaries'
  );

  useEffect(() => {
    const tab = searchParams.get("tab");
    if (validTabs.includes(tab) && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };
  const [isLoading, setIsLoading] = useState(true);
  const [summaries, setSummaries] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [materials, setMaterials] = useState([]);

  // Modal States
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [viewStartTime, setViewStartTime] = useState(null);
  const [isReviewMarked, setIsReviewMarked] = useState(false);
  const [isMarkingReview, setIsMarkingReview] = useState(false);

  // Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  // Reset filters when tab changes
  useEffect(() => {
    setSearchQuery('');
    setDateFilter('all');
    setSortOption('newest');
  }, [activeTab]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [sumRes, quizRes, flashRes, matRes] = await Promise.all([
        getSavedSummaries().catch(() => []),
        getSavedQuizzes().catch(() => []),
        getSavedFlashcards().catch(() => []),
        getStudyMaterials().catch(() => [])
      ]);

      setSummaries(normalizeList(sumRes));
      setQuizzes(normalizeList(quizRes));
      setFlashcards(normalizeList(flashRes));
      setMaterials(normalizeList(matRes));
    } catch (error) {
      console.error('Failed to load library:', error);
      toast.error('Failed to load your AI Library.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenView = (item) => {
    setSelectedItem(item);
    setViewModalOpen(true);
    if (activeTab === 'summaries') {
      setViewStartTime(Date.now());
      setIsReviewMarked(false);
    }
  };

  const handleOpenDelete = (item) => {
    setSelectedItem(item);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedItem) return;
    setIsDeleting(true);
    try {
      if (activeTab === 'summaries') {
        await deleteSavedSummary(selectedItem.id);
        setSummaries(summaries.filter(s => s.id !== selectedItem.id));
      } else if (activeTab === 'quizzes') {
        await deleteSavedQuiz(selectedItem.id);
        setQuizzes(quizzes.filter(q => q.id !== selectedItem.id));
      } else if (activeTab === 'flashcards') {
        await deleteSavedFlashcards(selectedItem.id);
        setFlashcards(flashcards.filter(f => f.id !== selectedItem.id));
      } else if (activeTab === 'materials') {
        await deleteStudyMaterial(selectedItem.id);
        setMaterials(materials.filter(m => m.id !== selectedItem.id));
      }
      
      toast.success('Item deleted successfully!');
      setDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (error) {
      console.error('Failed to delete item:', error);
      toast.error('Failed to delete item.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleMarkReviewed = async () => {
    if (!selectedItem || isReviewMarked || isMarkingReview) return;
    try {
      setIsMarkingReview(true);
      const duration = viewStartTime ? Math.floor((Date.now() - viewStartTime) / 1000) : 0;
      
      await saveSummaryReviewAttempt({
        subjectId: null,
        summaryId: selectedItem.id,
        sourceTitle: selectedItem.sourceTitle || selectedItem.title,
        summaryWordCount: selectedItem.wordCount || 0,
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

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown Date';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderSummaryContent = (content) => {
    if (!content) {
      return <p className="text-slate-600 dark:text-slate-300">No summary content available.</p>;
    }

    if (typeof content === "string") {
      return <p className="text-slate-700 dark:text-slate-200 whitespace-pre-line">{content}</p>;
    }

    const mainSummary = content.main_summary || content.mainSummary || "";
    const importantPoints = Array.isArray(content.important_points)
      ? content.important_points
      : Array.isArray(content.importantPoints)
      ? content.importantPoints
      : [];

    const keyTerms = Array.isArray(content.key_terms)
      ? content.key_terms
      : Array.isArray(content.keyTerms)
      ? content.keyTerms
      : [];

    const sectionSummaries = Array.isArray(content.section_summaries)
      ? content.section_summaries
      : Array.isArray(content.sectionSummaries)
      ? content.sectionSummaries
      : [];

    return (
      <div className="space-y-6">
        {mainSummary && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Main Summary
            </h3>
            <p className="text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line">
              {mainSummary}
            </p>
          </div>
        )}

        {importantPoints.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Important Points
            </h3>
            <ul className="space-y-2">
              {importantPoints.map((point, index) => (
                <li
                  key={index}
                  className="text-slate-700 dark:text-slate-200"
                >
                  {index + 1}. {typeof point === "string" ? point : JSON.stringify(point)}
                </li>
              ))}
            </ul>
          </div>
        )}

        {keyTerms.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Key Terms
            </h3>
            <div className="flex flex-wrap gap-2">
              {keyTerms.map((term, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full bg-brand-500/10 dark:bg-brand-500/20 text-brand-700 dark:text-brand-300"
                >
                  {typeof term === "string" ? term : JSON.stringify(term)}
                </span>
              ))}
            </div>
          </div>
        )}

        {sectionSummaries.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              Section Summaries
            </h3>
            <div className="space-y-3">
              {sectionSummaries.map((section, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700"
                >
                  {typeof section === "string" ? (
                    <p className="text-slate-700 dark:text-slate-200">{section}</p>
                  ) : (
                    <>
                      <h4 className="font-semibold text-slate-900 dark:text-white">
                        {section.title || `Section ${index + 1}`}
                      </h4>
                      <p className="text-slate-700 dark:text-slate-200 mt-1">
                        {section.summary || section.content || JSON.stringify(section)}
                      </p>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const getFilteredItems = () => {
    let sourceItems = [];
    if (activeTab === 'summaries') sourceItems = summaries;
    if (activeTab === 'quizzes') sourceItems = quizzes;
    if (activeTab === 'flashcards') sourceItems = flashcards;
    if (activeTab === 'materials') sourceItems = materials;

    // 1. Filter by search query
    let filtered = sourceItems;
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(item => {
        let textToSearch = '';
        
        if (activeTab === 'summaries') {
          textToSearch = toSearchableText([
            item.title,
            item.sourceTitle,
            item.sourceType,
            item.content?.main_summary || item.content?.mainSummary,
            item.content?.important_points || item.content?.importantPoints,
            item.content?.key_terms || item.content?.keyTerms,
            item.content?.section_summaries || item.content?.sectionSummaries
          ]);
        } else if (activeTab === 'quizzes') {
          textToSearch = toSearchableText([
            item.title,
            item.sourceTitle,
            item.sourceType,
            item.questions?.map(q => [q.question, q.options, q.correct_answer, q.explanation])
          ]);
        } else if (activeTab === 'flashcards') {
          textToSearch = toSearchableText([
            item.title,
            item.sourceTitle,
            item.sourceType,
            item.flashcards?.map(f => [f.front, f.back, f.category, f.difficulty])
          ]);
        } else if (activeTab === 'materials') {
          textToSearch = toSearchableText([
            item.title,
            item.fileName,
            item.sourceType,
            item.extractedText
          ]);
        }

        return textToSearch.toLowerCase().includes(lowerQuery);
      });
    }

    // 2. Filter by date
    filtered = filtered.filter(item => isWithinDateFilter(item.createdAt, dateFilter));

    // 3. Sort items
    filtered = [...filtered].sort((a, b) => {
      if (sortOption === 'newest') return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortOption === 'oldest') return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortOption === 'titleAsc') return (a.title || '').localeCompare(b.title || '');
      if (sortOption === 'titleDesc') return (b.title || '').localeCompare(a.title || '');
      
      if (activeTab === 'summaries' || activeTab === 'materials') {
        if (sortOption === 'wordsHigh') return (b.wordCount || 0) - (a.wordCount || 0);
        if (sortOption === 'wordsLow') return (a.wordCount || 0) - (b.wordCount || 0);
      }
      
      if (activeTab === 'quizzes') {
        if (sortOption === 'questionsHigh') return (b.questions?.length || 0) - (a.questions?.length || 0);
        if (sortOption === 'questionsLow') return (a.questions?.length || 0) - (b.questions?.length || 0);
      }
      
      if (activeTab === 'flashcards') {
        if (sortOption === 'cardsHigh') return (b.flashcards?.length || 0) - (a.flashcards?.length || 0);
        if (sortOption === 'cardsLow') return (a.flashcards?.length || 0) - (b.flashcards?.length || 0);
      }
      
      return 0;
    });

    return filtered;
  };

  const renderActiveList = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm text-gray-500 animate-pulse">Loading your library...</p>
        </div>
      );
    }

    let items = [];
    let emptyMessage = '';
    let emptyTitle = '';
    let EmptyIcon = Search;

    if (activeTab === 'summaries') {
      items = summaries;
      emptyTitle = 'No summaries found';
      emptyMessage = 'Generate and save a summary first.';
      EmptyIcon = FileText;
    } else if (activeTab === 'quizzes') {
      items = quizzes;
      emptyTitle = 'No quizzes found';
      emptyMessage = 'Generate and save a quiz first.';
      EmptyIcon = HelpCircle;
    } else if (activeTab === 'flashcards') {
      items = flashcards;
      emptyTitle = 'No flashcards found';
      emptyMessage = 'Generate and save a flashcard deck first.';
      EmptyIcon = Layers;
    } else if (activeTab === 'materials') {
      items = materials;
      emptyTitle = 'No PDF materials found';
      emptyMessage = 'Upload and extract a PDF first.';
      EmptyIcon = File;
    }

    if (items.length === 0) {
      return (
        <EmptyState
          icon={EmptyIcon}
          title={emptyTitle}
          description={emptyMessage}
        />
      );
    }

    const filteredItems = getFilteredItems();

    if (filteredItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 border-dashed">
          <Filter className="w-12 h-12 text-slate-400 mb-4 opacity-50" />
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">No results found</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-sm text-center mb-6">
            No {activeTab} match your current filters. Try adjusting your search or clearing filters.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setSearchQuery('');
              setDateFilter('all');
              setSortOption('newest');
            }}
            className="text-brand-600 border-brand-200 hover:bg-brand-50"
          >
            Clear Filters
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-400 px-1">
          Showing {filteredItems.length} of {items.length} {activeTab === 'materials' ? 'PDF materials' : activeTab === 'flashcards' ? 'flashcard decks' : activeTab}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card p-5 hover-lift group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="font-bold text-slate-900 dark:text-white text-lg line-clamp-1" title={item.title}>
                  {item.title || 'Untitled'}
                </h3>
                <div className="flex gap-1 opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenView(item)}
                    className="p-1.5 !text-slate-700 dark:!text-slate-100 hover:!text-purple-600 dark:hover:!text-purple-300 hover:bg-brand-500/10 rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenDelete(item)}
                    className="p-1.5 !text-slate-700 dark:!text-slate-100 hover:!text-red-600 dark:hover:!text-red-400 hover:bg-danger-500/10 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                {item.sourceTitle && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{item.sourceTitle}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{formatDate(item.createdAt)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-700/50 flex justify-between items-center text-xs font-semibold text-slate-600 dark:text-slate-300">
                {activeTab === 'summaries' && <span>{item.wordCount || 0} words</span>}
                {activeTab === 'quizzes' && <span>{item.questions?.length || 0} questions</span>}
                {activeTab === 'flashcards' && <span>{item.flashcards?.length || 0} cards</span>}
                {activeTab === 'materials' && <span>{item.wordCount || 0} words</span>}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        </div>
      </div>
    );
  };

  const renderViewModalContent = () => {
    if (!selectedItem) return null;

    if (activeTab === 'summaries') {
      return (
        <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {renderSummaryContent(selectedItem.content)}
        </div>
      );
    }

    if (activeTab === 'quizzes') {
      return (
        <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {selectedItem.questions?.map((q, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <p className="font-bold text-slate-800 dark:text-white mb-3">{i + 1}. {q.question}</p>
              <div className="space-y-2 mb-3">
                {q.options?.map((opt, j) => (
                  <div key={j} className={`px-3 py-2 rounded-lg text-sm ${opt === q.correct_answer ? 'bg-success-500/10 text-success-700 dark:text-success-400 border border-success-500/30' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    {opt}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <p className="text-xs text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10 p-2 rounded-md">
                  <span className="font-bold">Explanation: </span>{q.explanation}
                </p>
              )}
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'flashcards') {
      return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
          {selectedItem.flashcards?.map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-3">
              <div>
                <span className="text-[10px] font-bold uppercase text-brand-500 tracking-wider">Front</span>
                <p className="text-sm font-semibold text-slate-800 dark:text-white">{f.front}</p>
              </div>
              <div className="pt-3 border-t border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-bold uppercase text-purple-500 tracking-wider">Back</span>
                <p className="text-sm text-slate-700 dark:text-slate-300">{f.back}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === 'materials') {
      return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap">
          {selectedItem.extractedText}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen pb-20">
      <PageHeader
        title="My AI Library"
        description="View and manage all your saved study resources"
        icon={Library}
      />

      <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 mt-6">
        
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 p-1.5 glass-card rounded-2xl w-fit">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`
                  flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all
                  ${isActive 
                    ? 'bg-purple-500 !text-white shadow-lg' 
                    : '!text-slate-700 dark:!text-slate-200 hover:!text-purple-600 dark:hover:!text-purple-300'
                  }
                `}
              >
                <Icon className="w-5 h-5 !text-current" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl bg-white/70 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                activeTab === 'summaries' ? 'Search summaries by title, source, topic, or key term...' :
                activeTab === 'quizzes' ? 'Search quizzes by title, source, or question...' :
                activeTab === 'flashcards' ? 'Search flashcards by title, source, category, or card content...' :
                'Search PDF materials by title, file name, or content...'
              }
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:outline-none placeholder-slate-500 dark:placeholder-slate-400 transition-colors"
            />
          </div>
          
          <div className="flex flex-wrap md:flex-nowrap gap-3">
            <div className="relative min-w-[140px]">
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:outline-none appearance-none transition-colors"
              >
                <option value="all">All dates</option>
                <option value="today">Today</option>
                <option value="last7">Last 7 days</option>
                <option value="last30">Last 30 days</option>
                <option value="thisMonth">This month</option>
              </select>
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative min-w-[160px]">
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-brand-500 focus:outline-none appearance-none transition-colors"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="titleAsc">Title A-Z</option>
                <option value="titleDesc">Title Z-A</option>
                {(activeTab === 'summaries' || activeTab === 'materials') && (
                  <>
                    <option value="wordsHigh">Word count high to low</option>
                    <option value="wordsLow">Word count low to high</option>
                  </>
                )}
                {activeTab === 'quizzes' && (
                  <>
                    <option value="questionsHigh">Most questions</option>
                    <option value="questionsLow">Fewest questions</option>
                  </>
                )}
                {activeTab === 'flashcards' && (
                  <>
                    <option value="cardsHigh">Most cards</option>
                    <option value="cardsLow">Fewest cards</option>
                  </>
                )}
              </select>
            </div>

            {(searchQuery || dateFilter !== 'all' || sortOption !== 'newest') && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setDateFilter('all');
                  setSortOption('newest');
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-300 transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Clear Filters"
              >
                <X className="w-4 h-4" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {renderActiveList()}
        </div>
      </div>

      {/* View Modal */}
      <Modal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title={selectedItem?.title || 'Preview'}
        maxWidth="max-w-3xl"
      >
        <div className="mt-2 mb-6">
          {renderViewModalContent()}
        </div>
        <div className="flex justify-end gap-3 border-t border-slate-200 dark:border-slate-700 pt-4">
          {activeTab === 'summaries' && (
            <Button
              variant={isReviewMarked ? 'secondary' : 'primary'}
              onClick={handleMarkReviewed}
              disabled={isReviewMarked || isMarkingReview}
              className="flex items-center gap-2"
            >
              <CheckCircle className={`h-4 w-4 ${isReviewMarked ? 'text-brand-500' : ''}`} />
              {isReviewMarked ? 'Review Completed' : isMarkingReview ? 'Marking...' : 'Mark as Reviewed'}
            </Button>
          )}
          <Button variant="ghost" className="text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white" onClick={() => setViewModalOpen(false)}>
            Close
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Item"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">{selectedItem?.title}</span>? 
            This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3 mt-6">
            <Button variant="ghost" className="text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <button 
              onClick={handleConfirmDelete} 
              disabled={isDeleting}
              className="px-6 py-3 rounded-xl bg-red-500/10 border border-red-500 !text-red-600 dark:!text-red-300 hover:!bg-red-500 hover:!text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default AILibrary;
