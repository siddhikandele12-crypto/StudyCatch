import React, { useState } from 'react';
import { FileText, Send, CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Textarea } from './ui/textarea';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { generateQuizFromText } from '../lib/gemini';
import { Quiz, Question } from '../types';
import { toast } from 'sonner';

export const QuizPortal = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast.error('Please paste some text first');
      return;
    }
    setLoading(true);
    try {
      const generatedQuiz = await generateQuizFromText(text);
      setQuiz(generatedQuiz);
      setCurrentQuestionIndex(0);
      setAnswers([]);
      setShowResult(false);
      setScore(0);
      toast.success('Quiz generated successfully!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const currentQuestion = quiz!.questions[currentQuestionIndex];
    if (index === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz!.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setShowResult(true);
    }
  };

  const resetQuiz = () => {
    setQuiz(null);
    setText('');
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setShowResult(false);
    setScore(0);
  };

  if (showResult) {
    return (
      <Card className="brutalist-card max-w-2xl mx-auto text-center py-12">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary text-primary-foreground rounded-full brutalist-border">
              <Trophy className="w-12 h-12" />
            </div>
          </div>
          <CardTitle className="text-4xl font-display">Quiz Complete!</CardTitle>
          <CardDescription className="text-xl font-bold">
            You scored {score} out of {quiz!.questions.length}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-6xl font-mono font-bold">
            {Math.round((score / quiz!.questions.length) * 100)}%
          </div>
          <Progress value={(score / quiz!.questions.length) * 100} className="h-4 brutalist-border" />
          <div className="flex justify-center gap-4 pt-6">
            <Button onClick={resetQuiz} className="brutalist-button bg-primary text-primary-foreground">
              Try Another Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (quiz) {
    const currentQuestion = quiz.questions[currentQuestionIndex];
    return (
      <Card className="brutalist-card max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-center mb-2">
            <Badge variant="outline" className="brutalist-border font-mono">
              Question {currentQuestionIndex + 1} / {quiz.questions.length}
            </Badge>
            <Badge className="bg-primary text-primary-foreground">
              Score: {score}
            </Badge>
          </div>
          <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} className="h-2 mb-4" />
          <CardTitle className="text-2xl font-display leading-tight">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {currentQuestion.options.map((option, idx) => {
              const isCorrect = idx === currentQuestion.correctAnswer;
              const isSelected = idx === selectedOption;
              let variant = "outline";
              let className = "brutalist-button text-left justify-start h-auto py-4 px-6 text-lg transition-all ";
              
              if (selectedOption !== null) {
                if (isCorrect) className += "bg-green-500 text-white border-green-700 ";
                else if (isSelected) className += "bg-red-500 text-white border-red-700 ";
                else className += "opacity-50 ";
              }

              return (
                <Button
                  key={idx}
                  variant={variant as any}
                  className={className}
                  onClick={() => handleOptionSelect(idx)}
                  disabled={selectedOption !== null}
                >
                  <span className="mr-4 font-mono opacity-50">{String.fromCharCode(65 + idx)}.</span>
                  {option}
                  {selectedOption !== null && isCorrect && <CheckCircle2 className="ml-auto w-6 h-6" />}
                  {selectedOption !== null && isSelected && !isCorrect && <XCircle className="ml-auto w-6 h-6" />}
                </Button>
              );
            })}
          </div>

          {selectedOption !== null && (
            <div className="mt-6 p-4 bg-muted brutalist-border animate-in fade-in slide-in-from-bottom-2">
              <p className="font-bold mb-1 flex items-center gap-2">
                {selectedOption === currentQuestion.correctAnswer ? 
                  <span className="text-green-600">Correct!</span> : 
                  <span className="text-red-600">Incorrect.</span>
                }
              </p>
              <p className="text-sm opacity-80">{currentQuestion.explanation}</p>
              <Button onClick={handleNext} className="mt-4 w-full brutalist-button bg-primary text-primary-foreground">
                {currentQuestionIndex === quiz.questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="brutalist-card max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-2xl">
          <FileText className="w-6 h-6" />
          Quiz Generator
        </CardTitle>
        <CardDescription className="text-lg">
          Paste text from your PDF, notes, or textbook to generate a practice quiz instantly.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Textarea
          placeholder="Paste your study material here..."
          className="min-h-[300px] text-lg brutalist-border p-6 focus-visible:ring-0"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button 
          onClick={handleGenerate} 
          disabled={loading || !text.trim()} 
          className="w-full h-14 text-xl font-bold brutalist-button bg-primary text-primary-foreground"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RotateCcw className="animate-spin" /> Generating Quiz...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="w-5 h-5" /> Generate Practice Quiz
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
