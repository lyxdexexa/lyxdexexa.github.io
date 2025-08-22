import React from 'react';

interface ResultsScreenProps {
  score: number;
  totalQuestions: number;
  onReturnToStart: () => void;
  onReview: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ score, totalQuestions, onReturnToStart, onReview }) => {
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const getRingColor = () => {
    if (percentage >= 80) return 'stroke-green-500';
    if (percentage >= 50) return 'stroke-yellow-500';
    return 'stroke-red-500';
  };

  return (
    <div className="bg-slate-700 text-white p-8 rounded-xl shadow-2xl text-center flex flex-col items-center">
      <h2 className="text-3xl font-bold mb-4 text-cyan-400">Quiz Complete!</h2>
      <div className="relative my-6" style={{ width: 150, height: 150 }}>
          <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                  d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                  className="stroke-current text-slate-600"
                  fill="none"
                  strokeWidth="3"
              />
              <path
                  d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                  className={`stroke-current ${getRingColor()} transition-all duration-1000 ease-in-out`}
                  fill="none"
                  strokeWidth="3"
                  strokeDasharray={`${percentage}, 100`}
                  strokeLinecap="round"
              />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-bold text-white">{percentage}%</span>
          </div>
      </div>
      <p className="text-xl mb-2 text-slate-200">
        You scored <span className="font-bold text-cyan-400">{score}</span> out of <span className="font-bold text-cyan-400">{totalQuestions}</span>.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4 w-full">
        <button
          onClick={onReview}
          className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
        >
          Review Answers
        </button>
        <button
          onClick={onReturnToStart}
          className="w-full md:w-auto bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-8 rounded-lg text-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1"
        >
          Restart Quiz
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;