import React from 'react';
import { AnswerRecord, QuizQuestion } from '../types.ts';

interface ReviewScreenProps {
  userAnswers: AnswerRecord[];
  onReturnToStart: () => void;
  onRetryIncorrect: () => void;
  onRetryFullQuiz: () => void;
}

const sanitizeAnswer = (answer: string) => {
    return answer.replace(/^[a-z]\.\s/i, '').trim().replace(/\.$/, '').trim();
};

const ReviewScreen: React.FC<ReviewScreenProps> = ({ userAnswers, onReturnToStart, onRetryIncorrect, onRetryFullQuiz }) => {
  const incorrectCount = userAnswers.filter(a => !a.isCorrect).length;

  const getOptionClass = (option: string, question: QuizQuestion, selectedOptions: string[]) => {
    const sanitizedCorrectAnswers = (Array.isArray(question.correct_answer) ? question.correct_answer : [question.correct_answer]).map(sanitizeAnswer);
    const sanitizedSelectedOptions = selectedOptions.map(sanitizeAnswer);
    const sanitizedOption = sanitizeAnswer(option);

    const isCorrectAnswer = sanitizedCorrectAnswers.includes(sanitizedOption);
    const isSelected = sanitizedSelectedOptions.includes(sanitizedOption);

    if (isCorrectAnswer) {
      return 'bg-green-700 border-green-500';
    }

    if (isSelected && !isCorrectAnswer) {
      return 'bg-red-700 border-red-500';
    }

    return 'bg-slate-600 border-slate-500 opacity-70';
  };
    
  return (
    <div className="w-full">
      <h2 className="text-3xl font-bold mb-6 text-cyan-400 text-center">Review Your Answers</h2>
      <div className="space-y-8">
        {userAnswers.map((answerRecord, index) => (
          <div key={answerRecord.question.id} className="bg-slate-700 p-6 rounded-xl shadow-lg">
            <p className="text-sm font-medium text-slate-300">
              Question {index + 1} - 
              <span className={`font-bold ${answerRecord.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
                {answerRecord.isCorrect ? ' Correct' : ' Incorrect'}
              </span>
            </p>
            <h3 className="text-xl font-semibold my-2 text-slate-100" dangerouslySetInnerHTML={{ __html: answerRecord.question.question }}></h3>
            <div className="space-y-3 mt-4">
              {answerRecord.question.options.map(option => (
                <div key={option} className={`w-full text-left p-4 rounded-lg border-2 ${getOptionClass(option, answerRecord.question, answerRecord.selectedOptions)}`}>
                  {option}
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-slate-800 rounded-lg border border-slate-600">
              <h4 className="font-bold text-lg mb-2 text-cyan-400">Explanation</h4>
              <p className="text-slate-300">{answerRecord.question.explanation}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center flex flex-col sm:flex-row flex-wrap justify-center gap-4 w-full">
        <button
          onClick={onRetryIncorrect}
          disabled={incorrectCount === 0}
          className="w-full sm:w-auto flex-grow bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          Retry Incorrect ({incorrectCount})
        </button>
        <button
          onClick={onRetryFullQuiz}
          className="w-full sm:w-auto flex-grow bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
        >
          Retry Full Quiz ({userAnswers.length})
        </button>
        <button 
          onClick={onReturnToStart} 
          className="w-full sm:w-auto flex-grow bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
        >
          New Quiz
        </button>
      </div>
    </div>
  );
};

export default ReviewScreen;