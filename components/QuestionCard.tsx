import React, { useState, useMemo } from 'react';
import { QuizQuestion } from '../types.ts';

interface QuestionCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (selectedOptions: string[], isCorrect: boolean) => void;
  onNextQuestion: () => void;
  onReturnToStart: () => void;
}

const CheckIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);


const QuestionCard: React.FC<QuestionCardProps> = ({ question, questionNumber, totalQuestions, onSubmitAnswer, onNextQuestion, onReturnToStart }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);

  const isMultipleChoice = Array.isArray(question.correct_answer);
  
  const sanitizeAnswer = (answer: string) => {
    // This regex removes a letter, a dot, and a space from the start of a string. e.g., "a. "
    // It also trims whitespace and removes a trailing period.
    return answer.replace(/^[a-z]\.\s/i, '').trim().replace(/\.$/, '').trim();
  };

  const instructionText = useMemo(() => {
    if (!isMultipleChoice) {
      return null; // Single answer question
    }

    const questionText = question.question.toLowerCase();
    // Check for existing instructions like (Select TWO), (Choose 2), (Select all that apply)
    const hasInstruction = /\(select (\w+|\w+ \w+ \w+)\)|\(choose \w+\)/.test(questionText);

    if (hasInstruction) {
      return null; // Instruction already exists in the question
    }
    
    const numCorrect = question.correct_answer.length;
    if (numCorrect === 2) {
      return "(Select 2)";
    }
    if (numCorrect > 2) {
      return "(Select all that apply)";
    }
    
    return null; // Default to no instruction if logic doesn't catch it
  }, [question, isMultipleChoice]);


  const handleOptionClick = (option: string) => {
    if (isAnswered) return;

    setSelectedOptions(prev => {
      if (isMultipleChoice) {
        return prev.includes(option)
          ? prev.filter(item => item !== option)
          : [...prev, option];
      }
      return [option];
    });
  };

  const checkAnswer = () => {
    if (selectedOptions.length === 0) return;
    
    const correctAnswers = (Array.isArray(question.correct_answer) ? question.correct_answer : [question.correct_answer])
        .map(sanitizeAnswer);
    
    const sanitizedSelectedOptions = selectedOptions.map(sanitizeAnswer);

    const isCorrect = correctAnswers.length === sanitizedSelectedOptions.length &&
      correctAnswers.every(answer => sanitizedSelectedOptions.includes(answer));

    onSubmitAnswer(selectedOptions, isCorrect);
    setIsAnswered(true);
  };
  
  const getOptionClass = (option: string) => {
    if (!isAnswered) {
      return selectedOptions.includes(option)
        ? 'bg-cyan-600 border-cyan-400 ring-2 ring-cyan-300'
        : 'bg-slate-600 hover:bg-slate-500 border-slate-500';
    }

    const sanitizedCorrectAnswers = (Array.isArray(question.correct_answer) ? question.correct_answer : [question.correct_answer])
        .map(sanitizeAnswer);
    const sanitizedSelectedOption = sanitizeAnswer(option);
    
    const isCorrectAnswer = sanitizedCorrectAnswers.includes(sanitizedSelectedOption);
    const isSelected = selectedOptions.map(sanitizeAnswer).includes(sanitizedSelectedOption);

    if (isCorrectAnswer) return 'bg-green-700 border-green-500';
    if (isSelected && !isCorrectAnswer) return 'bg-red-700 border-red-500';
    
    return 'bg-slate-600 border-slate-500';
  };

  const handleQuit = () => {
    if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
      onReturnToStart();
    }
  };

  const progressPercentage = useMemo(() => (questionNumber / totalQuestions) * 100, [questionNumber, totalQuestions]);

  return (
    <div className="bg-slate-700 p-6 md:p-8 rounded-xl shadow-2xl text-white w-full">
      {/* Header */}
       <div className="flex justify-between items-center">
        <button
          onClick={handleQuit}
          className="text-slate-400 hover:text-white transition-colors duration-200"
          aria-label="Quit Quiz"
        >
          &larr; Quit Quiz
        </button>
        <p className="text-sm font-medium text-slate-300">
          Question {questionNumber} of {totalQuestions}
        </p>
        <p className="text-sm font-medium text-cyan-400">
          {question.category}
        </p>
      </div>


      {/* Progress Bar */}
      <div className="my-4">
        <div className="w-full bg-slate-600 rounded-full h-2.5">
          <div className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>

      {/* Question Text */}
      <h2 className="text-xl md:text-2xl font-semibold mb-6 text-slate-100" dangerouslySetInnerHTML={{ __html: question.question }}></h2>
      {instructionText && <p className="text-sm text-cyan-400 mb-4 -mt-2">{instructionText}</p>}
      
      {/* Options */}
      <div className="space-y-3 mb-6">
        {question.options && Array.isArray(question.options) && question.options.map((option) => (
          <button
            key={option}
            onClick={() => handleOptionClick(option)}
            disabled={isAnswered}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 flex items-center justify-between ${getOptionClass(option)} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
          >
            <span className="flex-grow">{option}</span>
            {isAnswered && (
                 (Array.isArray(question.correct_answer) ? question.correct_answer.map(sanitizeAnswer).includes(sanitizeAnswer(option)) : sanitizeAnswer(question.correct_answer) === sanitizeAnswer(option)) 
                 ? <CheckIcon className="h-6 w-6 text-white" />
                 : (selectedOptions.includes(option) && <XIcon className="h-6 w-6 text-white" />)
            )}
          </button>
        ))}
      </div>

      {/* Explanation */}
      {isAnswered && (
        <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-600">
          <h3 className="font-bold text-lg mb-2 text-cyan-400">Explanation</h3>
          <p className="text-slate-300">{question.explanation}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="mt-6 text-center">
        {!isAnswered ? (
          <button
            onClick={checkAnswer}
            disabled={selectedOptions.length === 0}
            className="w-full md:w-auto bg-cyan-500 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={onNextQuestion}
            className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
          >
            {questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;