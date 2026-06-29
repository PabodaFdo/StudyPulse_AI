const cleanOptionText = (option = '') => {
  return String(option)
    .replace(/^(?:\s*(?:Option\s+)?(?:[A-Ea-e][\.\:\-\)]|\([A-Ea-e]\))\s*)+/i, '')
    .trim();
};

const formatQuizResponse = (quizData) => {
  if (!quizData || !Array.isArray(quizData.questions)) return quizData;

  const cleanedQuestions = quizData.questions.map(q => {
    let cleanedOptions = q.options;
    if (Array.isArray(q.options)) {
      cleanedOptions = q.options.map(opt => cleanOptionText(opt));
    }

    let cleanedCorrectAnswer = q.correct_answer;
    if (q.correct_answer) {
      cleanedCorrectAnswer = cleanOptionText(q.correct_answer);
    }

    return {
      ...q,
      options: cleanedOptions,
      correct_answer: cleanedCorrectAnswer
    };
  });

  return {
    ...quizData,
    questions: cleanedQuestions
  };
};

module.exports = {
  cleanOptionText,
  formatQuizResponse
};
