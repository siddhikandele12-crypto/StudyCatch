import React, { useState } from 'react';
import { Video, FileText, Layout, BookOpen, Brain, ChevronLeft, ChevronRight, RotateCw, Sparkles, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Badge } from './ui/badge';
import { generateSummaryFromInput } from '../lib/gemini';
import { StudySummary, Flashcard } from '../types';
import { Mindmap } from './Mindmap';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';

export const StudyAccelerator = () => {
  const [input, setInput] = useState('');
  const [inputType, setInputType] = useState<'text' | 'video' | 'image'>('text');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<StudySummary | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setInput(content);
      toast.success(`Loaded ${file.name}`);
    };
    reader.readAsText(file);
  };

  const handleProcess = async () => {
    if (!input.trim()) {
      toast.error('Please provide some input first');
      return;
    }
    setLoading(true);
    try {
      const result = await generateSummaryFromInput(input, inputType);
      setSummary(result);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      toast.success('Study materials generated!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to process content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextCard = () => {
    if (summary) {
      setCurrentCardIndex((prev) => (prev + 1) % summary.flashcards.length);
      setIsFlipped(false);
    }
  };

  const prevCard = () => {
    if (summary) {
      setCurrentCardIndex((prev) => (prev - 1 + summary.flashcards.length) % summary.flashcards.length);
      setIsFlipped(false);
    }
  };

  if (summary) {
    return (
      <div className="space-y-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-display font-bold">{summary.title}</h2>
          <Button variant="outline" onClick={() => setSummary(null)} className="brutalist-button">
            New Session
          </Button>
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 brutalist-border p-1 bg-muted">
            <TabsTrigger value="summary" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
              <BookOpen className="w-4 h-4 mr-2" /> Summary
            </TabsTrigger>
            <TabsTrigger value="flashcards" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
              <Layout className="w-4 h-4 mr-2" /> Flashcards
            </TabsTrigger>
            <TabsTrigger value="mindmap" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
              <Brain className="w-4 h-4 mr-2" /> Mindmap
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <Card className="brutalist-card">
              <CardContent className="pt-6 prose dark:prose-invert max-w-none">
                <ReactMarkdown>{summary.summary}</ReactMarkdown>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="flashcards">
            <div className="flex flex-col items-center gap-8">
              <div className="relative w-full max-w-md h-64 perspective-1000">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentCardIndex + (isFlipped ? '-back' : '-front')}
                    initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                    animate={{ rotateY: 0, opacity: 1 }}
                    exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="w-full h-full cursor-pointer"
                  >
                    <div className="w-full h-full brutalist-card flex items-center justify-center text-center p-8 bg-card hover:bg-muted/50 transition-colors">
                      <div className="space-y-4">
                        <Badge variant="outline" className="font-mono">
                          {isFlipped ? 'ANSWER' : 'QUESTION'}
                        </Badge>
                        <p className="text-2xl font-display font-bold">
                          {isFlipped ? summary.flashcards[currentCardIndex].back : summary.flashcards[currentCardIndex].front}
                        </p>
                        <p className="text-xs opacity-50 uppercase tracking-widest">Click to flip</p>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-6">
                <Button onClick={prevCard} variant="outline" size="icon" className="brutalist-button rounded-full">
                  <ChevronLeft />
                </Button>
                <span className="font-mono font-bold">
                  {currentCardIndex + 1} / {summary.flashcards.length}
                </span>
                <Button onClick={nextCard} variant="outline" size="icon" className="brutalist-button rounded-full">
                  <ChevronRight />
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="mindmap">
            <Card className="brutalist-card overflow-hidden">
              <Mindmap data={summary.mindmap} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  return (
    <Card className="brutalist-card max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-display text-2xl">
          <Sparkles className="w-6 h-6" />
          Study Accelerator
        </CardTitle>
        <CardDescription className="text-lg">
          Paste video links, handwritten notes text, or PDF content to get a 10-min summary, flashcards, and a mindmap.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs value={inputType} onValueChange={(v) => setInputType(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 brutalist-border p-1 bg-muted">
            <TabsTrigger value="text" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
              <FileText className="w-4 h-4 mr-2" /> PDF/Notes
            </TabsTrigger>
            <TabsTrigger value="video" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
              <Video className="w-4 h-4 mr-2" /> Video Link
            </TabsTrigger>
            <TabsTrigger value="image" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">
              <Layout className="w-4 h-4 mr-2" /> Image Text
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="relative">
          <Textarea
            placeholder={
              inputType === 'video' 
                ? "Paste YouTube or video link here..." 
                : "Paste your text, notes, or transcript here..."
            }
            className="min-h-[250px] text-lg brutalist-border p-6 focus-visible:ring-0"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          {inputType !== 'video' && (
            <div className="absolute bottom-4 right-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
                accept=".txt,.md,.json"
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="brutalist-button bg-background"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" /> Upload Text File
              </Button>
            </div>
          )}
        </div>

        <Button 
          onClick={handleProcess} 
          disabled={loading || !input.trim()} 
          className="w-full h-14 text-xl font-bold brutalist-button bg-primary text-primary-foreground"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              <RotateCw className="animate-spin" /> Processing Content...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Brain className="w-5 h-5" /> Generate Study Materials
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
