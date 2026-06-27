import React from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  know_this: string;
  domain?: string;
}

interface QuizRendererProps {
  questions: Question[];
  onComplete?: (results: any) => void;
}

export default function QuizRenderer({ questions, onComplete }: QuizRendererProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, string>>({});
  const [revealed, setRevealed] = React.useState(false);

  const currentQuestion = questions[currentIndex];
  const selected = selectedAnswers[currentQuestion.id];
  const isCorrect = selected === currentQuestion.correct;
  const isLast = currentIndex === questions.length - 1;

  function handleSelect(option: string) {
    if (revealed) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQuestion.id]: option }));
  }

  function handleCheck() {
    setRevealed(true);
  }

  function handleNext() {
    setRevealed(false);
    if (isLast) {
      onComplete?.(calculateResults());
    } else {
      setCurrentIndex(i => i + 1);
    }
  }

  function calculateResults() {
    let correctCount = 0;
    const domainScores: Record<string, { correct: number; total: number }> = {};

    questions.forEach(q => {
      const userAnswer = selectedAnswers[q.id];
      const correct = userAnswer === q.correct;
      if (correct) correctCount++;
      const domain = q.domain || 'general';
      if (!domainScores[domain]) domainScores[domain] = { correct: 0, total: 0 };
      domainScores[domain].total++;
      if (correct) domainScores[domain].correct++;
    });

    return {
      overall_score: Math.round((correctCount / questions.length) * 100),
      correct_count: correctCount,
      total_questions: questions.length,
      domain_scores: Object.fromEntries(
        Object.entries(domainScores).map(([d, s]) => [d, Math.round((s.correct / s.total) * 100)])
      ),
      selected_answers: selectedAnswers,
      questions,
    };
  }

  const progressPct = Math.round(((currentIndex + (revealed ? 1 : 0)) / questions.length) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-[#EDE0D4]/40 mb-2">
          <span>Question {currentIndex + 1} of {questions.length}</span>
          <span>{progressPct}% complete</span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#C9874F] to-[#A0522D] rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="text-lg font-medium leading-relaxed">{currentQuestion.question}</div>

      {/* Options */}
      <div className="flex flex-col gap-3">
        {currentQuestion.options.map((option, idx) => {
          const letter = option[0];
          const isSelected = selected === letter;
          const isAnswer = letter === currentQuestion.correct;

          let borderColor = 'border-white/10';
          let bg = 'bg-white/[0.03]';
          let textColor = 'text-[#EDE0D4]';

          if (revealed) {
            if (isAnswer) {
              bg = 'bg-green-500/10';
              borderColor = 'border-green-500/60';
              textColor = 'text-green-400';
            } else if (isSelected && !isAnswer) {
              bg = 'bg-red-500/10';
              borderColor = 'border-red-500/60';
              textColor = 'text-red-400';
            }
          } else if (isSelected) {
            bg = 'bg-[#C9874F]/15';
            borderColor = 'border-[#C9874F]/60';
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(letter)}
              disabled={revealed}
              className={`text-left px-5 py-3.5 rounded-xl border transition-all ${bg} ${borderColor} ${textColor} ${!revealed ? 'hover:border-[#C9874F]/40 cursor-pointer' : 'cursor-default'}`}
            >
              <span className="font-medium mr-2">{option[0]})</span>
              {option.slice(3)}
            </button>
          );
        })}
      </div>

      {/* Explanation panel */}
      {revealed && (
        <div className={`rounded-2xl p-5 border ${isCorrect ? 'bg-green-500/5 border-green-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
          <div className={`text-sm font-semibold mb-1 ${isCorrect ? 'text-green-400' : 'text-red-400'}`}>
            {isCorrect ? '✓ Correct!' : `✗ Incorrect — correct answer: ${currentQuestion.correct}`}
          </div>
          <p className="text-sm text-[#EDE0D4]/80 mb-3 leading-relaxed">{currentQuestion.explanation}</p>
          <div className="flex items-start gap-2 bg-[#C9874F]/10 border border-[#C9874F]/20 rounded-xl px-4 py-3">
            <span className="text-[#C9874F] text-xs font-semibold mt-0.5 shrink-0">KNOW THIS</span>
            <p className="text-xs text-[#EDE0D4]/70 leading-relaxed">{currentQuestion.know_this}</p>
          </div>
        </div>
      )}

      {/* Action button */}
      {!revealed ? (
        <button
          onClick={handleCheck}
          disabled={!selected}
          className={`w-full py-3.5 rounded-2xl font-medium transition-all ${
            selected
              ? 'bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white hover:opacity-90'
              : 'bg-white/5 text-[#EDE0D4]/30 cursor-not-allowed'
          }`}
        >
          Check Answer
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-2xl font-medium bg-gradient-to-r from-[#C9874F] to-[#A0522D] text-white hover:opacity-90 transition-all"
        >
          {isLast ? 'See Results' : 'Next Question →'}
        </button>
      )}
    </div>
  );
}
