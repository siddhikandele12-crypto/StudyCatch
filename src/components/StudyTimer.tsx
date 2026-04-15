import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer as TimerIcon, Clock, StopCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { StudyLog } from '../types';

export const StudyTimer = () => {
  const [mode, setMode] = useState<'pomodoro' | 'stopwatch' | 'timer'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [pomodoroState, setPomodoroState] = useState<'work' | 'break'>('work');
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [logs, setLogs] = useState<StudyLog[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    const savedLogs = localStorage.getItem('study_logs');
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  useEffect(() => {
    localStorage.setItem('study_logs', JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        if (mode === 'pomodoro') {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              handlePomodoroComplete();
              return 0;
            }
            return prev - 1;
          });
        } else if (mode === 'stopwatch') {
          setStopwatchTime((prev) => prev + 1);
        }
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handlePomodoroComplete = () => {
    setIsRunning(false);
    const duration = pomodoroState === 'work' ? 25 * 60 : 5 * 60;
    
    if (pomodoroState === 'work') {
      const newLog: StudyLog = {
        id: crypto.randomUUID(),
        startTime: Date.now() - duration * 1000,
        duration,
        type: 'pomodoro',
        category: 'Study'
      };
      setLogs([newLog, ...logs]);
      setPomodoroState('break');
      setTimeLeft(5 * 60);
    } else {
      setPomodoroState('work');
      setTimeLeft(25 * 60);
    }
    
    // Simple notification
    if (Notification.permission === 'granted') {
      new Notification(pomodoroState === 'work' ? 'Work session complete!' : 'Break over!');
    }
  };

  const toggleTimer = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'pomodoro') {
      setTimeLeft(pomodoroState === 'work' ? 25 * 60 : 5 * 60);
    } else if (mode === 'stopwatch') {
      setStopwatchTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const saveStopwatchSession = () => {
    if (stopwatchTime > 0) {
      const newLog: StudyLog = {
        id: crypto.randomUUID(),
        startTime: Date.now() - stopwatchTime * 1000,
        duration: stopwatchTime,
        type: 'focus',
        category: 'Focus'
      };
      setLogs([newLog, ...logs]);
      setStopwatchTime(0);
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <Card className="brutalist-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-2xl">
            <TimerIcon className="w-6 h-6" />
            Study Timer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(v) => { setMode(v as any); setIsRunning(false); }} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 brutalist-border p-1 bg-muted">
              <TabsTrigger value="pomodoro" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">Pomodoro</TabsTrigger>
              <TabsTrigger value="stopwatch" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-bold">Stopwatch</TabsTrigger>
            </TabsList>

            <TabsContent value="pomodoro" className="text-center space-y-6">
              <div className="text-7xl font-mono font-bold tracking-tighter">
                {formatTime(timeLeft)}
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={toggleTimer} size="lg" className="brutalist-button bg-primary text-primary-foreground">
                  {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={resetTimer} variant="outline" size="lg" className="brutalist-button">
                  <RotateCcw className="mr-2" /> Reset
                </Button>
              </div>
              <div className="space-y-2">
                <p className="text-sm font-bold uppercase tracking-widest opacity-60">
                  {pomodoroState === 'work' ? 'Focus Session' : 'Break Time'}
                </p>
                <Progress value={(timeLeft / (pomodoroState === 'work' ? 25 * 60 : 5 * 60)) * 100} className="h-3 brutalist-border" />
              </div>
            </TabsContent>

            <TabsContent value="stopwatch" className="text-center space-y-6">
              <div className="text-7xl font-mono font-bold tracking-tighter">
                {formatTime(stopwatchTime)}
              </div>
              <div className="flex justify-center gap-4">
                <Button onClick={toggleTimer} size="lg" className="brutalist-button bg-primary text-primary-foreground">
                  {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                  {isRunning ? 'Pause' : 'Start'}
                </Button>
                <Button onClick={saveStopwatchSession} variant="destructive" size="lg" className="brutalist-button">
                  <StopCircle className="mr-2" /> Stop & Save
                </Button>
                <Button onClick={resetTimer} variant="outline" size="lg" className="brutalist-button">
                  <RotateCcw className="mr-2" /> Reset
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card className="brutalist-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-display text-xl">
            <Clock className="w-5 h-5" />
            Study History (YPT Style)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.length === 0 ? (
              <p className="text-center py-8 opacity-50 italic">No study sessions recorded yet.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 brutalist-border bg-muted/30">
                  <div>
                    <p className="font-bold">{log.category}</p>
                    <p className="text-xs opacity-60">{new Date(log.startTime).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono font-bold">{formatTime(log.duration)}</p>
                    <Badge variant="outline" className="text-[10px] uppercase">{log.type}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
