import React from 'react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: string;
  explanation: string;
  know_this: string;
}

interface QuizRendererProps {
  questions: Question[];
  onComplete?: (results: any) => void;
}

export default function QuizRenderer({ questions, onComplete }: QuizRendererProps) {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [selectedAnswers, setSelectedAnswers] = React.useState<Record<number, string>>({});
  const [showResults, setShowResults] = React.useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSelect = (option: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestion.id]: option,
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setShowResults(true);
      if (onComplete) {
        const results = calculateResults();
        onComplete(results);
      }
    }
  };

  const calculateResults = () => {
    let correctCount = 0;
    const domainScores: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q) => {
      const userAnswer = selectedAnswers[q.id];
      const isCorrect = userAnswer === q.correct;
      
      if (isCorrect) correctCount++;

      // Simple domain scoring (you can enhance this)
      const domain = (q as any).domain || 'general';
      if (!domainScores[domain]) {
        domainScores[domain] = { correct: 0, total: 0 };
      }
      domainScores[domain].total++;
      if (isCorrect) domainScores[domain].correct++;
    });

    const overallScore = Math.round((correctCount / questions.length) * 100);

    return {
      overall_score: overallScore,
      correct_count: correctCount,
      total_questions: questions.length,
      domain_scores: Object.fromEntries(
        Object.entries(domainScores).map(([d, scores]) => [
          d,
          Math.round((scores.correct / scores.total) * 100),
        ])
      ),
      selected_answers: selectedAnswers,
    };
  };

  if (showResults) {
    const results = calculateResults();
    return (
      <div style={{ padding: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12 }}>
        <h3 style={{ color: '#C9874F', marginBottom: 16 }}>Quiz Complete</h3>
        <div style={{ fontSize: 24, fontWeight: 600, marginBottom: 20 }}>
          Score: {results.overall_score}%
        </div>
        
        <div style={{ marginBottom: 20 }}>
          {Object.entries(results.domain_scores).map(([domain, score]) => (
            <div key={domain} style={{ marginBottom: 8 }}>
              {domain}: {score}%
            </div>
          ))}
        </div>

        <button 
          onClick={() => {
            setCurrentIndex(0);
            setSelectedAnswers({});
            setShowResults(false);
          }}
          style={{
            background: 'linear-gradient(135deg, #C9874F, #A0522D)',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: 8,
            cursor: 'pointer',
          }}
        >
          Retake Quiz
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: 20 }}>
      <div style={{ marginBottom: 12, color: 'rgba(237,224,212,0.6)' }}>
        Question {currentIndex + 1} of {questions.length}
      </div>

      <div style={{ fontSize: 18, marginBottom: 20, lineHeight: 1.5 }}>
        {currentQuestion.question}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {currentQuestion.options.map((option, idx) => {
          const isSelected = selectedAnswers[currentQuestion.id] === option;
          return (
            <button
              key={idx}
              onClick={() => handleSelect(option)}
              style={{
                textAlign: 'left',
                padding: '14px 18px',
                background: isSelected 
                  ? 'rgba(201,135,79,0.2)' 
                  : 'rgba(255,255,255,0.04)',
                border: isSelected 
                  ? '1px solid #C9874F' 
                  : '1px solid rgba(201,135,79,0.15)',
                borderRadius: 10,
                color: '#EDE0D4',
                cursor: 'pointer',
                fontSize: 15,
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleNext}
        disabled={!selectedAnswers[currentQuestion.id]}
        style={{
          marginTop: 24,
          width: '100%',
          padding: '14px',
          background: selectedAnswers[currentQuestion.id] 
            ? 'linear-gradient(135deg, #C9874F, #A0522D)' 
            : 'rgba(255,255,255,0.1)',
          color: 'white',
          border: 'none',
          borderRadius: 10,
          fontSize: 16,
          cursor: selectedAnswers[currentQuestion.id] ? 'pointer' : 'not-allowed',
        }}
      >
        {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
      </button>
    </div>
  );
}
