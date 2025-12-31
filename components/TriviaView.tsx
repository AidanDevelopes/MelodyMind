
import React, { useState } from 'react';
import { Question, QuestionFormat, User } from '../types';
import { Button } from './Button';

interface TriviaViewProps {
  questions: Question[];
  format: QuestionFormat;
  currentUser: User;
  onQuestionCorrect: (spentPoints: number) => void;
  onFinish: () => void;
  onExit: () => void;
}

export const TriviaView: React.FC<TriviaViewProps> = ({ 
  questions, 
  format, 
  currentUser,
  onQuestionCorrect, 
  onFinish,
  onExit
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [writtenAnswer, setWrittenAnswer] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  const [hintVisible, setHintVisible] = useState(false);
  const [removedIndex, setRemovedIndex] = useState<number | null>(null);
  const [spentOnQuestion, setSpentOnQuestion] = useState(0);

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const handleShopHint = () => {
    if (currentUser.permanentPoints >= 100 && !hintVisible) {
      setHintVisible(true);
      setSpentOnQuestion(prev => prev + 100);
    }
  };

  const handleShopRemove = () => {
    if (format === QuestionFormat.MULTIPLE_CHOICE && currentUser.permanentPoints >= 50 && removedIndex === null) {
      const wrongIndices = currentQuestion.options!
        .map((opt, i) => opt !== currentQuestion.correctAnswer ? i : -1)
        .filter(i => i !== -1);
      const randomIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      setRemovedIndex(randomIndex);
      setSpentOnQuestion(prev => prev + 50);
    }
  };

  const handleSubmit = () => {
    if (isSubmitted) return;

    let correct = false;
    if (format === QuestionFormat.MULTIPLE_CHOICE) {
      if (!selectedOption) return;
      correct = selectedOption === currentQuestion.correctAnswer;
    } else {
      if (!writtenAnswer.trim()) return;
      const user = writtenAnswer.trim().toLowerCase();
      const actual = currentQuestion.correctAnswer.toLowerCase();
      correct = user === actual || (actual.includes(user) && user.length > 2);
    }

    setIsCorrect(correct);
    setIsSubmitted(true);
    if (correct) {
      onQuestionCorrect(spentOnQuestion);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setWrittenAnswer('');
      setIsSubmitted(false);
      setIsCorrect(null);
      setHintVisible(false);
      setRemovedIndex(null);
      setSpentOnQuestion(0);
    } else {
      onFinish();
    }
  };

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Game Stats & Powerups Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700/50 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-6">
            <button 
              onClick={onExit}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <span className="font-bold text-slate-300">Quit Session</span>
          </div>

          <div className="space-y-1 mb-8">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Progress</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-black">{currentIndex + 1}</span>
              <span className="text-slate-500 mb-1 font-bold">/ {questions.length}</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden mt-2 border border-slate-800">
              <div className="h-full music-gradient transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-2">Shop Power-Ups</p>
            <button 
              onClick={handleShopHint}
              disabled={hintVisible || currentUser.permanentPoints < 100 || isSubmitted}
              className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${hintVisible ? 'border-cyan-500/20 bg-cyan-500/5 text-cyan-500' : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-cyan-500/30'}`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                <span className="text-xs font-bold uppercase">Hint</span>
              </div>
              <span className={`text-[10px] font-black ${currentUser.permanentPoints < 100 && !hintVisible ? 'text-rose-500' : 'text-cyan-400'}`}>100 Pts</span>
            </button>

            {format === QuestionFormat.MULTIPLE_CHOICE && (
              <button 
                onClick={handleShopRemove}
                disabled={removedIndex !== null || currentUser.permanentPoints < 50 || isSubmitted}
                className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${removedIndex !== null ? 'border-amber-500/20 bg-amber-500/5 text-amber-500' : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-amber-500/30'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">✂️</span>
                  <span className="text-xs font-bold uppercase">Remove 1</span>
                </div>
                <span className={`text-[10px] font-black ${currentUser.permanentPoints < 50 && removedIndex === null ? 'text-rose-500' : 'text-amber-400'}`}>50 Pts</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Question Area */}
      <div className="lg:col-span-3 space-y-6">
        <div className="bg-slate-800/40 rounded-3xl p-10 border border-slate-700/50 backdrop-blur-xl card-shadow min-h-[500px] flex flex-col justify-center relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
            </svg>
          </div>

          {hintVisible && (
            <div className="mb-8 p-4 bg-cyan-500/10 border-l-4 border-cyan-500 rounded-r-xl animate-in slide-in-from-left duration-300">
              <p className="text-cyan-200 text-sm font-medium italic">" {currentQuestion.hint} "</p>
            </div>
          )}

          <div className="mb-12 relative z-10">
            <h3 className="text-3xl md:text-4xl font-black leading-tight text-white drop-shadow-sm">
              {currentQuestion.question}
            </h3>
          </div>

          <div className="space-y-4 mb-8 relative z-10">
            {format === QuestionFormat.MULTIPLE_CHOICE ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentQuestion.options?.map((option, idx) => {
                  const isSelected = selectedOption === option;
                  const isCorrectOption = option === currentQuestion.correctAnswer;
                  const isRemoved = removedIndex === idx;
                  
                  let btnClass = "group p-6 rounded-2xl border-2 transition-all text-left font-bold relative overflow-hidden ";
                  if (isRemoved) {
                    btnClass += "border-slate-900 bg-slate-950 opacity-10 cursor-not-allowed";
                  } else if (!isSubmitted) {
                    btnClass += isSelected 
                      ? "border-purple-500 bg-purple-500/10 text-white" 
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-600 hover:text-slate-200";
                  } else {
                    if (isCorrectOption) btnClass += "border-emerald-500 bg-emerald-500/10 text-emerald-100 shadow-lg shadow-emerald-500/5";
                    else if (isSelected) btnClass += "border-rose-500 bg-rose-500/10 text-rose-100";
                    else btnClass += "border-slate-900 bg-slate-950 opacity-30";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isSubmitted || isRemoved}
                      onClick={() => setSelectedOption(option)}
                      className={btnClass}
                    >
                      <div className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs transition-colors ${isSelected ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700'}`}>
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span className="flex-1">{option}</span>
                      </div>
                      {isCorrectOption && isSubmitted && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500">
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-4">
                <input
                  type="text"
                  disabled={isSubmitted}
                  autoFocus
                  placeholder="Type your answer here..."
                  className={`w-full bg-slate-950 border-2 rounded-2xl p-6 text-xl outline-none transition-all ${isSubmitted ? (isCorrect ? 'border-emerald-500 text-emerald-200' : 'border-rose-500 text-rose-200') : 'border-slate-800 focus:border-purple-500'}`}
                  value={writtenAnswer}
                  onChange={(e) => setWrittenAnswer(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
                {isSubmitted && !isCorrect && (
                  <div className="p-4 bg-slate-900 rounded-xl border border-slate-800">
                    <p className="text-xs font-black uppercase text-slate-500 tracking-widest mb-1">Correct Answer</p>
                    <p className="text-xl font-bold text-emerald-400">{currentQuestion.correctAnswer}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {isSubmitted && (
            <div className={`p-6 rounded-2xl border-2 mb-8 animate-in zoom-in-95 duration-300 ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-rose-500/5 border-rose-500/20'}`}>
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg ${isCorrect ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                  {isCorrect ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </div>
                <div>
                  <h4 className={`font-black uppercase tracking-wider text-xs mb-1 ${isCorrect ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {isCorrect ? 'Knowledge Confirmed' : 'Educational Moment'}
                  </h4>
                  <p className="text-slate-300 text-sm leading-relaxed">{currentQuestion.explanation}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto relative z-10 pt-6">
            {!isSubmitted ? (
              <Button fullWidth onClick={handleSubmit} disabled={format === QuestionFormat.MULTIPLE_CHOICE ? !selectedOption : !writtenAnswer.trim()}>
                Submit Response
              </Button>
            ) : (
              <Button variant="secondary" fullWidth onClick={handleNext} className="bg-slate-700 hover:bg-slate-600 border border-slate-600">
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Complete Session'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
