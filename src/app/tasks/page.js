'use client';
import React, { useState, useEffect} from 'react';
import { Timer, CheckCircle, BarChart, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function HomePage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({ title: '', duration: 30 });
  const [activeTask, setActiveTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [points, setPoints] = useState(0);
  const [dailyReport, setDailyReport] = useState([]);

  const [timerWindow, setTimerWindow] = useState(null);

  // Function to create and update timer window
  const updateTimerWindow = () => {
    if (!timerWindow || timerWindow.closed) return;

    const totalSeconds = activeTask?.duration * 60 || 0;
    const progress = (timeLeft / totalSeconds) * 100;
    const color = progress > 50 ? '#22c55e' : progress > 20 ? '#eab308' : '#ef4444';

    const timerHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Task Timer</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              margin: 0;
              background: white;
              overflow: hidden;
            }
            .container {
              text-align: center;
            }
            .task-name {
              font-size: 16px;
              font-weight: bold;
              margin-bottom: 10px;
              color: #374151;
            }
            .timer {
              font-size: 32px;
              font-weight: bold;
              margin: 10px 0;
              color: #111827;
            }
            .progress-bar {
              width: 100%;
              height: 8px;
              background: #E5E7EB;
              border-radius: 4px;
              overflow: hidden;
              margin: 10px 0;
            }
            .progress {
              height: 100%;
              background: ${color};
              width: ${progress}%;
              transition: width 1s ease, background-color 1s ease;
            }
            .percentage {
              font-size: 14px;
              color: #6B7280;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="task-name">${activeTask?.title || ''}</div>
            <div class="timer">${formatTime(timeLeft)}</div>
            <div class="progress-bar">
              <div class="progress"></div>
            </div>
            <div class="percentage">${Math.round(progress)}% remaining</div>
          </div>
        </body>
      </html>
    `;

    timerWindow.document.documentElement.innerHTML = timerHTML;
  };

  // Update timer window when time changes
  useEffect(() => {
    if (isRunning && activeTask) {
      updateTimerWindow();
    }
  }, [timeLeft, isRunning, activeTask]);

  useEffect(() => {
    let interval;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => {
          if (time <= 1) {
            handleTimeOut();
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const addTask = (e) => {
    e.preventDefault();
    if (newTask.title && newTask.duration) {
      setTasks([...tasks, { 
        ...newTask, 
        id: Date.now(),
        status: 'pending',
        startTime: null,
        endTime: null,
        timedOut: false
      }]);
      setNewTask({ title: '', duration: 30 });
    }
  };

  const startTask = async (task) => {
    if (activeTask) {
      const updatedTasks = tasks.map(t => 
        t.id === activeTask.id ? { ...t, status: 'pending', timedOut: true } : t
      );
      setTasks(updatedTasks);
    }

    // Close existing timer window if open
    if (timerWindow && !timerWindow.closed) {
      timerWindow.close();
    }

    // Open new timer window
    const newTimerWindow = window.open('', 'Timer', 
      'width=300,height=200,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no'
    );
    setTimerWindow(newTimerWindow);

    setActiveTask(task);
    setTimeLeft(task.duration * 60);
    setIsRunning(true);
    
    const updatedTasks = tasks.map(t => 
      t.id === task.id ? { ...t, status: 'active', startTime: new Date() } : t
    );
    setTasks(updatedTasks);

  };

  const handleTimeOut = async () => {
    if (!activeTask) return;
    
    const updatedTasks = tasks.map(t => 
      t.id === activeTask.id ? { 
        ...t, 
        status: 'pending',
        timedOut: true
      } : t
    );
    
    setTasks(updatedTasks);
    setActiveTask(null);
    setIsRunning(false);
    setTimeLeft(0);
    
     // Close timer window
     if (timerWindow && !timerWindow.closed) {
      timerWindow.close();
    }

  };
  
  // New function to calculate points based on duration
  const calculatePointsForTask = (duration) => {
    // Calculate how many 15-minute blocks the task spans
    const fifteenMinBlocks = Math.ceil(duration / 15);
    // Each block is worth 5 points
    return fifteenMinBlocks * 5;
  };

  // Complete a task
  const completeTask = async (task) => {
    const endTime = new Date();
    const isOnTime = task.id === activeTask?.id ? timeLeft > 0 : !task.timedOut;
    const earnedPoints = isOnTime ? calculatePointsForTask(task.duration) : 0;
    
    const updatedTasks = tasks.map(t => 
      t.id === task.id ? { 
        ...t, 
        status: 'completed', 
        endTime: endTime 
      } : t
    );
    
    setDailyReport([...dailyReport, {
      ...task,
      completedOn: endTime,
      onTime: isOnTime,
      pointsEarned: earnedPoints,
      possiblePoints: calculatePointsForTask(task.duration)
    }]);
    
    if (isOnTime) {
      setPoints(points + earnedPoints);
    }
    
    if (task.id === activeTask?.id) {
      setActiveTask(null);
      setIsRunning(false);
      setTimeLeft(0);
      
      // Close timer window
      if (timerWindow && !timerWindow.closed) {
        timerWindow.close();
      }
    }
    
    setTasks(updatedTasks);
  };

  // Clean up timer window on unmount
  useEffect(() => {
    return () => {
      if (timerWindow && !timerWindow.closed) {
        timerWindow.close();
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      {/* Task Manager Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-6 h-6" />
            Focus Task Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={addTask} className="flex gap-4 mb-6">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task name"
              className="flex-1 p-2 border rounded"
            />
            <input
              type="number"
              value={newTask.duration}
              onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
              placeholder="Minutes"
              className="w-20 p-2 border rounded"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </form>

          {activeTask && (
            <div className="mb-6 p-4 bg-blue-50 rounded flex items-center justify-between">
              <div>
                <p>Current Task: {activeTask.title}</p>
                <p className="text-2xl font-bold">{formatTime(timeLeft)}</p>
              </div>
              <button
                onClick={() => completeTask(activeTask)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Mark Complete
              </button>
            </div>
          )}

<div className="space-y-4">
            {tasks.filter(task => task.status !== 'completed').map(task => (
              <div 
                key={task.id}
                className="p-4 border rounded flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {task.timedOut ? (
                    <XCircle className="w-5 h-5 text-red-500" />
                  ) : (
                    <Timer className="w-5 h-5 text-blue-500" />
                  )}
                  <div>
                    <span className={task.timedOut ? 'text-red-500' : ''}>
                      {task.title} ({task.duration} minutes)
                    </span>
                    <div className="text-sm text-gray-500">
                      Potential points: {calculatePointsForTask(task.duration)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {task.status === 'pending' && (
                    <>
                      <button
                        onClick={() => completeTask(task)}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => startTask(task)}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Start
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Daily Report Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-6 h-6" />
            Daily Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded">
              <p className="text-lg font-semibold">Points Earned</p>
              <p className="text-3xl font-bold text-blue-600">{points}</p>
              <p className="text-sm text-gray-600 mt-1">
                Points scale with task duration: 5 points per 15-minute block
              </p>  
            </div>
            
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Completed Tasks:</h3>
              {dailyReport.map((task, index) => (
                <div key={index} className="flex items-center gap-2 py-2 border-b">
                  {task.onTime ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span>{task.title}</span>
                  <span className="text-sm text-gray-500 ml-auto">
                    {task.onTime ? `(On time +${task.pointsEarned}pts)` : '(Overtime +0pts)'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
    
    
  );
}


