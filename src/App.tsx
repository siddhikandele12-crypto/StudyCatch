import React, { useState, useEffect } from 'react';
import { Moon, Sun, GraduationCap, Timer, BookOpen, LayoutDashboard, Settings } from 'lucide-react';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import { QuizPortal } from '@/components/QuizPortal';
import { StudyAccelerator } from '@/components/StudyAccelerator';
import { StudyTimer } from '@/components/StudyTimer';
import { Switch } from './components/ui/switch';

export default function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Toaster position="top-center" />
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-md border-b-2 border-black dark:border-white">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary text-primary-foreground brutalist-border">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-display font-bold tracking-tight">StudyFlow AI</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 brutalist-border bg-muted/50">
              {theme === 'light' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
              <span className="text-xs font-bold uppercase tracking-widest hidden sm:inline">
                {theme === 'light' ? 'B&W Light' : 'B&W Dark'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="brutalist-border p-1 bg-muted h-auto flex-wrap justify-center">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold py-2 px-6">
                <LayoutDashboard className="w-4 h-4 mr-2" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="quiz" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold py-2 px-6">
                <BookOpen className="w-4 h-4 mr-2" /> Quiz Portal
              </TabsTrigger>
              <TabsTrigger value="accelerator" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold py-2 px-6">
                <GraduationCap className="w-4 h-4 mr-2" /> Accelerator
              </TabsTrigger>
              <TabsTrigger value="timer" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold py-2 px-6">
                <Timer className="w-4 h-4 mr-2" /> Study Timer
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="dashboard" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="brutalist-card bg-primary text-primary-foreground">
                  <h2 className="text-4xl font-display font-bold mb-2">Welcome back!</h2>
                  <p className="text-lg opacity-80">Ready to accelerate your learning today?</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                    <div className="text-center p-4 bg-background/10 brutalist-border border-white/20">
                      <p className="text-3xl font-mono font-bold">12h</p>
                      <p className="text-[10px] uppercase font-bold opacity-60">Total Study</p>
                    </div>
                    <div className="text-center p-4 bg-background/10 brutalist-border border-white/20">
                      <p className="text-3xl font-mono font-bold">85%</p>
                      <p className="text-[10px] uppercase font-bold opacity-60">Avg Score</p>
                    </div>
                    <div className="text-center p-4 bg-background/10 brutalist-border border-white/20">
                      <p className="text-3xl font-mono font-bold">5</p>
                      <p className="text-[10px] uppercase font-bold opacity-60">Day Streak</p>
                    </div>
                    <div className="text-center p-4 bg-background/10 brutalist-border border-white/20">
                      <p className="text-3xl font-mono font-bold">24</p>
                      <p className="text-[10px] uppercase font-bold opacity-60">Cards Mastered</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div 
                    onClick={() => setActiveTab('quiz')}
                    className="brutalist-card hover:bg-muted cursor-pointer transition-colors group"
                  >
                    <BookOpen className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-display font-bold">Quiz Portal</h3>
                    <p className="text-sm opacity-60">Turn your PDFs into practice questions instantly.</p>
                  </div>
                  <div 
                    onClick={() => setActiveTab('accelerator')}
                    className="brutalist-card hover:bg-muted cursor-pointer transition-colors group"
                  >
                    <GraduationCap className="w-10 h-10 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-display font-bold">Accelerator</h3>
                    <p className="text-sm opacity-60">Summaries, flashcards, and mindmaps from any source.</p>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="brutalist-card">
                  <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                    <Timer className="w-5 h-5" /> Quick Timer
                  </h3>
                  <div className="text-4xl font-mono font-bold text-center py-4">25:00</div>
                  <Button 
                    onClick={() => setActiveTab('timer')}
                    className="w-full brutalist-button bg-primary text-primary-foreground"
                  >
                    Start Focus Session
                  </Button>
                </div>

                <div className="brutalist-card bg-muted/30">
                  <h3 className="text-xl font-display font-bold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 text-sm">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <p className="flex-1">Completed Biology Quiz</p>
                        <span className="opacity-40 text-[10px]">2h ago</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="quiz" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <QuizPortal />
          </TabsContent>

          <TabsContent value="accelerator" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StudyAccelerator />
          </TabsContent>

          <TabsContent value="timer" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <StudyTimer />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t-2 border-black dark:border-white py-12 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="w-5 h-5" />
            <span className="font-display font-bold">StudyFlow AI</span>
          </div>
          <p className="text-sm opacity-50 max-w-md mx-auto">
            Your all-in-one AI study companion. Built for students who want to learn faster and stay focused.
          </p>
          <div className="flex justify-center gap-6 mt-8 text-[10px] font-bold uppercase tracking-widest opacity-40">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
