import { useState, useEffect } from 'react';
import { 
  Upload, File, Sparkles, CheckCircle2, AlertCircle, 
  Copy, Check, FileText, LayoutGrid, HelpCircle, Info, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { extractPdfText } from '../services/pdf.service';
import { saveStudyMaterial } from '../services/studyMaterial.service';
import { subjectService } from '../services/subject.service';
import { noteService } from '../services/note.service';

const PDF_STORAGE_KEY = 'studypulse_extracted_pdf';

const UploadPDF = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState(null);
  
  // UI states
  const [isDragging, setIsDragging] = useState(false);
  const [copied, setCopied] = useState(false);

  // Smart Note Modal State
  const [subjects, setSubjects] = useState([]);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [noteSubjectId, setNoteSubjectId] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await subjectService.getSubjects();
        setSubjects(data);
      } catch (err) {
        console.error('Failed to load subjects', err);
      }
    };
    fetchSubjects();
  }, []);

  const handleSaveAsSmartNote = async () => {
    if (!noteSubjectId) {
      toast.error('Please select a subject');
      return;
    }
    if (!noteTitle.trim()) {
      toast.error('Please enter a Topic / Note Title');
      return;
    }
    setIsSavingNote(true);
    try {
      await noteService.createNote({
        title: noteTitle,
        content: analysisResult.text,
        subjectId: Number(noteSubjectId)
      });
      setIsNoteModalOpen(false);
      toast.success((t) => (
        <div className="flex flex-col gap-2">
          <span>Extracted PDF saved as Smart Note.</span>
          <button 
            onClick={() => { toast.dismiss(t.id); navigate('/smart-notes'); }}
            className="px-3 py-1.5 bg-brand-500 text-white text-xs font-bold rounded-lg w-fit transition-colors hover:bg-brand-600"
          >
            View in Smart Notes
          </button>
        </div>
      ), { duration: 6000 });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save Smart Note');
    } finally {
      setIsSavingNote(false);
    }
  };

  // Restore saved extraction result on mount
  useEffect(() => {
    const savedPdf = sessionStorage.getItem(PDF_STORAGE_KEY);
    if (savedPdf) {
      try {
        setAnalysisResult(JSON.parse(savedPdf));
      } catch (err) {
        sessionStorage.removeItem(PDF_STORAGE_KEY);
      }
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (selectedFile) {
      if (selectedFile.type === 'application/pdf') {
        if (selectedFile.size > 20 * 1024 * 1024) {
          toast.error('File size exceeds 20MB limit.');
          return;
        }
        setFile(selectedFile);
        setAnalysisResult(null);
        setError(null);
      } else {
        toast.error('Only PDF files are supported.');
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first.');
      return;
    }
    setUploading(true);
    setError(null);

    try {
      const data = await extractPdfText(file);
      setAnalysisResult(data);
      sessionStorage.setItem(PDF_STORAGE_KEY, JSON.stringify(data));
      localStorage.setItem("studypulse_extracted_text", data.text);
      localStorage.setItem("studypulse_extracted_text_updated_at", Date.now().toString());

      try {
        const savedMaterial = await saveStudyMaterial({
          title: file.name,
          fileName: file.name,
          extractedText: data.text,
          wordCount: data.text.split(/\s+/).filter(w => w.length > 0).length
        });
        
        if (savedMaterial.success && savedMaterial.data) {
          localStorage.setItem("studypulse_selected_material_id", savedMaterial.data.id);
        }
      } catch (saveErr) {
        console.error("Failed to permanently save extracted PDF to DB:", saveErr);
        toast.error("Extracted text saved locally, but failed to sync to database.");
      }

      // Clear old generated AI results
      localStorage.removeItem("studypulse_generated_quiz");
      localStorage.removeItem("studypulse_quiz_selected_answers");
      localStorage.removeItem("studypulse_quiz_checked_questions");
      
      localStorage.removeItem("studypulse_generated_flashcards");
      localStorage.removeItem("studypulse_flashcard_current_index");
      localStorage.removeItem("studypulse_flashcard_flipped");
      localStorage.removeItem("studypulse_flashcard_status");
      
      localStorage.removeItem("studypulse_generated_summary");

      toast.success('PDF extracted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to extract text from PDF');
      toast.error('Failed to process PDF');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setAnalysisResult(null);
    setError(null);
    setUploading(false);
    setCopied(false);
    sessionStorage.removeItem(PDF_STORAGE_KEY);
  };

  const handleCopyText = () => {
    if (analysisResult?.text) {
      navigator.clipboard.writeText(analysisResult.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const saveExtractedPdfContext = () => {
    if (!analysisResult?.text) return;
    
    sessionStorage.setItem(
      PDF_STORAGE_KEY,
      JSON.stringify({
        filename: analysisResult.filename,
        pageCount: analysisResult.pageCount,
        characterCount: analysisResult.characterCount,
        text: analysisResult.text,
      })
    );
  };

  const handleNavigate = (route) => {
    if (!analysisResult?.text) return;
    saveExtractedPdfContext();
    navigate(route);
  };

  const nextSteps = [
    { 
      title: 'Create Flashcards', 
      description: 'Turn extracted text into revision flashcards.',
      icon: LayoutGrid, 
      color: 'text-purple-500', 
      bg: 'bg-purple-500/10',
      route: '/flashcards'
    },
    { 
      title: 'Generate Quiz', 
      description: 'Create practice questions from extracted text.',
      icon: HelpCircle, 
      color: 'text-green-500', 
      bg: 'bg-green-500/10',
      route: '/quiz-generator'
    }
  ];

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Upload PDF Lecture"
        subtitle="Extract text from your lecture notes and prepare them for summaries, quizzes, and flashcards."
        icon={Upload}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Upload Card */}
        <div className="app-panel p-6 md:p-8 space-y-6">
          
          {/* Empty State Instructions */}
          {!file && !analysisResult && (
            <div className="flex items-start gap-3 p-4 rounded-xl bg-brand-500/5 border border-brand-500/20 text-brand-700 dark:text-brand-300">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <p className="text-sm">
                Upload a lecture PDF to extract text. The extracted text can later be used for summaries, quizzes, flashcards, and AI study plans.
              </p>
            </div>
          )}

          {/* Drag & Drop Area */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative overflow-hidden border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 flex flex-col items-center justify-center
              ${isDragging ? 'border-brand-500 bg-brand-500/10 scale-[1.01]' : ''}
              ${file ? 'border-brand-500/40 bg-brand-500/5' : 'app-soft-card hover:bg-purple-100/50 dark:hover:bg-slate-800/80'}
            `}
          >
            <input
              type="file"
              id="pdf-upload"
              accept=".pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center w-full">
              <div className={`p-4 rounded-full mb-4 transition-colors ${file ? 'bg-brand-500/20 text-brand-600 dark:text-brand-400' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                {file ? <File className="h-10 w-10" /> : <Upload className="h-10 w-10" />}
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">
                {file ? 'Change PDF File' : 'Upload Lecture PDF'}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">
                Drag and drop your document here, or click to browse your files.
              </p>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-3 py-1.5 rounded-full">
                <span>PDF only</span>
                <span className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600"></span>
                <span>Max 20MB</span>
              </div>
            </label>
          </div>

          {/* Selected File Details */}
          {file && (
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 rounded-xl app-card gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                <div className="bg-red-100 dark:bg-red-500/20 p-3 rounded-lg text-red-500 shrink-0">
                  <FileText className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800 dark:text-white truncate" title={file.name}>
                    {file.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatFileSize(file.size)}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                    <span className="uppercase">{file.name.split('.').pop()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-red-800 dark:text-red-400">Extraction Error</h4>
                <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
                <p className="text-xs text-red-500 dark:text-red-400 mt-2 font-medium">
                  Suggestion: Please upload a selectable-text PDF. Scanned PDFs (images) may not extract correctly without OCR.
                </p>
              </div>
            </div>
          )}

          {/* Action Row */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleUpload}
              disabled={!file || uploading}
              className="inline-flex flex-1 items-center justify-center rounded-xl bg-brand-500 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {uploading ? 'Extracting...' : 'Extract Text'}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={uploading}
              className="inline-flex items-center justify-center rounded-xl app-input px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:!text-cyan-200"
            >
              Reset
            </button>
          </div>

          {/* Small Loading Card */}
          {uploading && (
            <div className="mt-4 rounded-xl border border-cyan-300/30 bg-cyan-50/80 p-4 text-sm font-semibold text-cyan-700 dark:border-cyan-400/30 dark:bg-cyan-500/10 dark:text-cyan-300">
              Extracting text from PDF...
            </div>
          )}

        </div>

        {/* Results Section */}
        {analysisResult && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* Success Banner & Stats */}
            <div className="app-panel p-6 border border-success-500/30 bg-success-500/5 shadow-lg space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-success-100 dark:bg-success-500/20 p-2 rounded-full text-success-600 dark:text-success-400">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-success-800 dark:text-success-400 text-lg">PDF Extracted Successfully</h3>
                    <p className="text-sm text-success-600 dark:text-success-500/80">{analysisResult.filename}</p>
                  </div>
                </div>
                {analysisResult.message && (
                  <span className="inline-block px-3 py-1 bg-success-100 dark:bg-success-500/20 text-success-700 dark:text-success-300 text-xs font-medium rounded-full">
                    {analysisResult.message}
                  </span>
                )}
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="app-soft-card p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Pages</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{analysisResult.pageCount}</p>
                </div>
                <div className="app-soft-card p-4 rounded-xl flex flex-col items-center justify-center text-center">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Characters</p>
                  <p className="text-2xl font-bold text-slate-800 dark:text-white">{analysisResult.characterCount.toLocaleString()}</p>
                </div>
                <div className="app-soft-card p-4 rounded-xl flex flex-col items-center justify-center text-center col-span-2 md:col-span-1">
                  <p className="text-slate-500 dark:text-slate-400 text-xs font-medium mb-1 uppercase tracking-wider">Status</p>
                  <p className="text-lg font-bold text-success-500 dark:text-success-400">Ready for AI</p>
                </div>
              </div>
            </div>

            {/* Extracted Text Preview */}
            {analysisResult.text && (
              <div className="app-panel overflow-hidden">
                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-brand-500" />
                    Extracted Text Preview
                  </h3>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setNoteTitle(analysisResult.filename.replace('.pdf', ''));
                        setIsNoteModalOpen(true);
                      }}
                      className="inline-flex items-center gap-2 rounded-lg border border-brand-300/40 bg-brand-50 px-3 py-1.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-100 dark:border-brand-400/40 dark:bg-brand-500/10 dark:!text-brand-300 dark:hover:bg-brand-500/20"
                    >
                      <Sparkles className="h-4 w-4" />
                      Save as Smart Note
                    </button>
                    <button 
                      onClick={handleCopyText}
                      className="inline-flex items-center gap-2 rounded-lg border border-purple-300/40 bg-purple-50 px-3 py-1.5 text-xs font-bold text-purple-700 transition-colors hover:bg-purple-100 dark:border-purple-400/40 dark:bg-purple-500/10 dark:!text-purple-300 dark:hover:bg-purple-500/20"
                    >
                      {copied ? <Check className="h-4 w-4 text-success-500" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy Text'}
                    </button>
                  </div>
                </div>
                
                <div className="p-4">
                  <pre className="max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-6 text-slate-800 dark:border-white/10 dark:bg-navy-900/80 dark:text-slate-100">
                    {analysisResult.text}
                  </pre>
                </div>
              </div>
            )}

            {/* Next Steps (Navigable Cards) */}
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-white px-2">Next Steps</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {nextSteps.map((step, idx) => {
                  const hasText = !!analysisResult?.text;
                  return (
                    <div 
                      key={idx} 
                      onClick={() => hasText && handleNavigate(step.route)}
                      className={`app-soft-card p-5 rounded-xl transition-all ${
                        hasText 
                          ? 'cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 group' 
                          : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className={`${step.bg} ${step.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${hasText ? 'group-hover:scale-110 transition-transform' : ''}`}>
                        <step.icon className="h-5 w-5" />
                      </div>
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm mb-1">{step.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {step.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Smart Note Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm px-4">
          <div className="app-panel w-full max-w-lg overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-brand-500" /> Save as Smart Note
              </h3>
              <button onClick={() => setIsNoteModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-5 space-y-4 overflow-y-auto max-h-[60vh]">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Subject</label>
                <select 
                  value={noteSubjectId} 
                  onChange={(e) => setNoteSubjectId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl app-input text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-400"
                >
                  <option value="">Select a subject...</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name || s.subjectName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Topic / Note Title</label>
                <input 
                  type="text" 
                  value={noteTitle} 
                  onChange={(e) => setNoteTitle(e.target.value)}
                  placeholder="e.g. Operating Systems Lecture 1"
                  className="w-full px-4 py-2.5 rounded-xl app-input text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">Content Preview</label>
                <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-400 font-mono h-32 overflow-y-auto whitespace-pre-wrap">
                  {analysisResult?.text}
                </div>
              </div>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-3 bg-slate-50 dark:bg-slate-800/20">
              <button 
                onClick={() => setIsNoteModalOpen(false)}
                disabled={isSavingNote}
                className="px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleSaveAsSmartNote}
                disabled={isSavingNote}
                className="px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-semibold flex items-center gap-2 transition-colors disabled:opacity-60"
              >
                {isSavingNote ? 'Saving...' : 'Save Smart Note'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPDF;
