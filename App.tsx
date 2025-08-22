import React, { useState, useEffect } from 'react';
import StartScreen from './components/StartScreen.tsx';
import QuestionCard from './components/QuestionCard.tsx';
import ResultsScreen from './components/ResultsScreen.tsx';
import ReviewScreen from './components/ReviewScreen.tsx';
import { GameState, QuizQuestion, AnswerRecord } from './types.ts';
import { quizQuestions } from './data/questions.ts';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('start');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [rawQuestions, setRawQuestions] = useState<QuizQuestion[]>([]);
  const [totalQuestionsFromFile, setTotalQuestionsFromFile] = useState<number>(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<AnswerRecord[]>([]);
  const [usedQuestionIds, setUsedQuestionIds] = useState<string[]>(() => {
    try {
      const storedIds = localStorage.getItem('usedQuestionIds');
      return storedIds ? JSON.parse(storedIds) : [];
    } catch (error) {
      console.error("Error reading used questions from localStorage", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('usedQuestionIds', JSON.stringify(usedQuestionIds));
    } catch (error) {
      console.error("Error saving used questions to localStorage", error);
    }
  }, [usedQuestionIds]);

  useEffect(() => {
    const data = quizQuestions;
    setTotalQuestionsFromFile(data.length);
    // Filter out unsupported question types and questions without options
    const filteredQuestions = data.filter(q => {
      if (!q.question || !q.category || !Array.isArray(q.options) || q.options.length === 0) {
        return false;
      }
      const questionText = q.question.toLowerCase();
      const isUnsupported = questionText.includes('drag') || questionText.includes('drop') || questionText.includes('dropdown') || questionText.includes('selectors');
      return !isUnsupported;
    });
    setRawQuestions(filteredQuestions);
  }, []);

  const handleStartQuiz = (category: string, numQuestions: number, excludePrevious: boolean) => {
    let availableQuestions = [...rawQuestions];
    
    // 0. Filter out previously used questions if option is selected for "All" category
    if (category === 'All' && excludePrevious) {
      availableQuestions = availableQuestions.filter(q => !usedQuestionIds.includes(q.id));
    }

    let questionsForQuiz = availableQuestions;

    // 1. Filter by category
    if (category !== 'All') {
      questionsForQuiz = questionsForQuiz.filter(q => q.category === category);
    }

    // 2. Shuffle the filtered questions
    for (let i = questionsForQuiz.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questionsForQuiz[i], questionsForQuiz[j]] = [questionsForQuiz[j], questionsForQuiz[i]];
    }
    
    // 3. Slice to the desired number
    const finalQuestions = questionsForQuiz.slice(0, numQuestions);

    setQuestions(finalQuestions);
    setGameState('active');
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
  };

  const handleAnswerSubmit = (selectedOptions: string[], isCorrect: boolean) => {
    if (isCorrect) {
      setScore(prevScore => prevScore + 1);
    }
     setUserAnswers(prev => [...prev, {
      question: questions[currentQuestionIndex],
      selectedOptions: selectedOptions,
      isCorrect: isCorrect,
    }]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      const newUsedIds = questions.map(q => q.id);
      setUsedQuestionIds(prev => [...new Set([...prev, ...newUsedIds])]);
      setGameState('finished');
    }
  };

  const handleReturnToStart = () => {
    setGameState('start');
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuestions([]);
    setUserAnswers([]);
  };
  
  const handleReview = () => {
    setGameState('review');
  };

  const handleRetryIncorrect = () => {
    const incorrectQuestions = userAnswers.filter(a => !a.isCorrect).map(a => a.question);
    if (incorrectQuestions.length === 0) return;

    for (let i = incorrectQuestions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [incorrectQuestions[i], incorrectQuestions[j]] = [incorrectQuestions[j], incorrectQuestions[i]];
    }

    setQuestions(incorrectQuestions);
    setGameState('active');
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
  };

  const handleRetryFullQuiz = () => {
    const shuffledQuestions = [...questions];
    for (let i = shuffledQuestions.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffledQuestions[i], shuffledQuestions[j]] = [shuffledQuestions[j], shuffledQuestions[i]];
    }

    setQuestions(shuffledQuestions);
    setGameState('active');
    setCurrentQuestionIndex(0);
    setScore(0);
    setUserAnswers([]);
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your question history? This action cannot be undone.')) {
      setUsedQuestionIds([]);
    }
  };

  const renderContent = () => {
    switch (gameState) {
      case 'active':
        if (questions.length > 0 && currentQuestionIndex < questions.length) {
          const currentQuestion = questions[currentQuestionIndex];
          return (
            <QuestionCard
              key={currentQuestion.id}
              question={currentQuestion}
              questionNumber={currentQuestionIndex + 1}
              totalQuestions={questions.length}
              onSubmitAnswer={handleAnswerSubmit}
              onNextQuestion={handleNextQuestion}
              onReturnToStart={handleReturnToStart}
            />
          );
        }
        return null;
      case 'finished':
        return (
          <ResultsScreen
            score={score}
            totalQuestions={questions.length}
            onReturnToStart={handleReturnToStart}
            onReview={handleReview}
          />
        );
      case 'review':
        return (
          <ReviewScreen 
            userAnswers={userAnswers}
            onReturnToStart={handleReturnToStart}
            onRetryIncorrect={handleRetryIncorrect}
            onRetryFullQuiz={handleRetryFullQuiz}
          />
        );
      case 'start':
      default:
        return (
          <StartScreen
            questions={rawQuestions}
            onStart={handleStartQuiz}
            isLoading={rawQuestions.length === 0}
            totalQuestionsFromFile={totalQuestionsFromFile}
            usedQuestionCount={usedQuestionIds.length}
            onClearHistory={handleClearHistory}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-800 p-4 font-sans">
      <header className="mb-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 tracking-wider">IT Knowledge Quiz</h1>
        <p className="text-slate-400 mt-2">Test your skills with questions on Networking, Hardware, and more.</p>
      </header>
      <main className="w-full max-w-2xl">
        {renderContent()}
      </main>
      <footer className="mt-8 text-slate-500 text-sm">
        <p>Powered by React & Tailwind CSS</p>
      </footer>
    </div>
  );
};

export default App;