import React, { useState, useMemo, useEffect } from 'react';
import { QuizQuestion } from '../types.ts';

interface StartScreenProps {
  questions: QuizQuestion[];
  onStart: (category: string, numQuestions: number, excludePrevious: boolean) => void;
  isLoading: boolean;
  totalQuestionsFromFile: number;
  usedQuestionCount: number;
  onClearHistory: () => void;
}

const StartScreen: React.FC<StartScreenProps> = ({ questions, onStart, isLoading, totalQuestionsFromFile, usedQuestionCount, onClearHistory }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [numQuestions, setNumQuestions] = useState<number>(10);
  const [excludePrevious, setExcludePrevious] = useState<boolean>(false);

  const categories = useMemo(() => {
    if (isLoading || questions.length === 0) return [];
    return ['All', ...Array.from(new Set(questions.map(q => q.category)))];
  }, [questions, isLoading]);
  
  const maxQuestions = useMemo(() => {
    if (selectedCategory === 'All') {
      if (excludePrevious) {
        return questions.length - usedQuestionCount;
      }
      return questions.length;
    }
    return questions.filter(q => q.category === selectedCategory).length;
  }, [selectedCategory, questions, excludePrevious, usedQuestionCount]);

  useEffect(() => {
    if (numQuestions > maxQuestions && maxQuestions > 0) {
      setNumQuestions(maxQuestions);
    }
    if (maxQuestions > 0 && numQuestions === 0) {
      setNumQuestions(Math.min(10, maxQuestions));
    }
  }, [selectedCategory, maxQuestions, numQuestions]);

  const handleStartClick = () => {
    onStart(selectedCategory, numQuestions, excludePrevious);
  };
  
  const isReady = !isLoading && questions.length > 0;

  return (
    <div className="bg-slate-700 text-white p-8 rounded-xl shadow-2xl text-center transition-transform transform hover:scale-105 duration-300">
      <h2 className="text-3xl font-bold mb-4 text-cyan-400">Welcome to the IT Quiz!</h2>
      <p className="text-lg mb-6 text-slate-300">
        Customize your quiz below and start when you're ready.
      </p>

      {isLoading ? (
        <p className="text-lg mb-6 text-slate-300">Loading questions...</p>
      ) : (
        <div className="space-y-6 mb-8">
          {/* Category Selector */}
          <div>
            <label htmlFor="category-select" className="block text-lg font-medium mb-2 text-slate-300">
              Choose a Category:
            </label>
            <select
              id="category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              disabled={!isReady}
              className="w-full bg-slate-600 border border-slate-500 rounded-lg p-3 text-lg focus:ring-cyan-500 focus:border-cyan-500"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Exclude Previous Questions Checkbox */}
          {selectedCategory === 'All' && isReady && (
            <div className="text-left">
              <label htmlFor="exclude-previous" className="flex items-center text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  id="exclude-previous"
                  checked={excludePrevious}
                  onChange={(e) => setExcludePrevious(e.target.checked)}
                  className="h-5 w-5 rounded border-slate-500 bg-slate-600 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="ml-3 text-lg">Don't include previous questions</span>
              </label>
              {excludePrevious && usedQuestionCount > 0 && (
                 <p className="text-sm text-slate-400 mt-1 pl-8">
                    Excluding {usedQuestionCount} previously seen questions.
                </p>
              )}
            </div>
          )}

          {/* Number of Questions Input */}
          <div>
            <label htmlFor="num-questions" className="block text-lg font-medium mb-2 text-slate-300">
              Number of Questions:
            </label>
            <input
              type="number"
              id="num-questions"
              value={numQuestions}
              onChange={(e) => setNumQuestions(Math.max(1, Math.min(maxQuestions, Number(e.target.value))))}
              min="1"
              max={maxQuestions}
              disabled={!isReady || maxQuestions === 0}
              className="w-full bg-slate-600 border border-slate-500 rounded-lg p-3 text-lg focus:ring-cyan-500 focus:border-cyan-500"
            />
             {selectedCategory === 'All' && totalQuestionsFromFile > 0 ? (
                <p className="text-sm text-slate-400 mt-1">
                    Showing {maxQuestions} playable of {totalQuestionsFromFile} total questions.
                </p>
            ) : (
                <p className="text-sm text-slate-400 mt-1">Max playable: {maxQuestions}</p>
            )}
          </div>
        </div>
      )}

      <button
        onClick={handleStartClick}
        disabled={!isReady || numQuestions === 0 || maxQuestions === 0}
        className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-lg text-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isLoading ? 'Loading...' : 'Start Quiz'}
      </button>
      
      {usedQuestionCount > 0 && (
        <div className="mt-6">
            <button
                onClick={onClearHistory}
                className="text-sm text-slate-400 hover:text-cyan-400 underline transition-colors duration-200"
            >
                Clear question history ({usedQuestionCount} questions)
            </button>
        </div>
      )}
    </div>
  );
};

export default StartScreen;