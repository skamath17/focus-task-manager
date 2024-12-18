'use client';
import React, { useState, useEffect} from 'react';
import { Timer, CheckCircle, BarChart, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Link from 'next/link';


// function to check if this is a new day
const isNewDay = () => {
  const lastAccessed = localStorage.getItem('lastAccessDate');
  const today = new Date().toDateString();
  
  if (lastAccessed !== today) {
    // It's a new day, update the access date
    localStorage.setItem('lastAccessDate', today);
    return true;
  }
  return false;
}

export default function HomePage() {
  const [tasks, setTasks] = useState(() => {
    if (typeof window !== 'undefined') {
      if (isNewDay()) {
        // Clear old data and start fresh
        localStorage.removeItem('tasks');
        localStorage.removeItem('points');
        localStorage.removeItem('dailyReport');
        return [];
      }
      const savedTasks = localStorage.getItem('tasks');
      return savedTasks ? JSON.parse(savedTasks) : [];
    }
    return [];
  });
  const [newTask, setNewTask] = useState({ title: '', duration: 30 });
  const [activeTask, setActiveTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [points, setPoints] = useState(() => {
    if (typeof window !== 'undefined' && !isNewDay()) {
      const savedPoints = localStorage.getItem('points');
      return savedPoints ? parseInt(savedPoints) : 0;
    }
    return 0;
  });
  const [dailyReport, setDailyReport] = useState(() => {
    if (typeof window !== 'undefined' && !isNewDay()) {
      const savedReport = localStorage.getItem('dailyReport');
      return savedReport ? JSON.parse(savedReport) : [];
    }
    return [];
  });
  const [isMobile, setIsMobile] = useState(false);

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
      <title>${activeTask?.title || 'Timer'}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 10px;
          margin: 0;
          background: white;
          overflow: hidden;
        }
        .container {
          display: flex;
          align-items: center;
          gap: 15px;
          height: 80px;
        }
        .timer {
          font-size: 36px;
          font-weight: bold;
          color: #111827;
          min-width: 120px;
        }
        .progress-container {
          flex-grow: 1;
        }
        .progress-bar {
          width: 100%;
          height: 8px;
          background: #E5E7EB;
          border-radius: 4px;
          overflow: hidden;
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
          margin-top: 4px;
        }
        .complete-button {
          cursor: pointer;
          padding: 8px;
          border-radius: 50%;
          transition: background-color 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .complete-button:hover {
          background-color: #f3f4f6;
        }
        .complete-button svg {
          width: 24px;
          height: 24px;
          color: #22c55e;
        }
        @keyframes completeAnimation {
          0% { transform: scale(1); }
          50% { transform: scale(1.2); }
          100% { transform: scale(0); }
        }
        .completing {
          animation: completeAnimation 0.5s ease-out forwards;
        }
      </style>
      <script>
        window.handleComplete = function() {
          document.getElementById('mainContainer').classList.add('completing');
          window.opener.postMessage({ type: 'completeTask' }, '*');
          setTimeout(() => window.close(), 500);
        }
      </script>
    </head>
    <body>
      <div class="container" id="mainContainer">
        <div class="timer">${formatTime(timeLeft)}</div>
        <div class="progress-container">
          <div class="progress-bar">
            <div class="progress"></div>
          </div>
          <div class="percentage">${Math.round(progress)}% remaining</div>
        </div>
        <div class="complete-button" 
            onclick="document.getElementById('mainContainer').classList.add('completing'); 
                    window.opener.postMessage({ type: 'completeTask' }, '*');
                    setTimeout(() => window.close(), 500);" 
            title="Mark as complete">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        </div>
      </div>
    </body>
  </html>
    `;

    timerWindow.document.documentElement.innerHTML = timerHTML;
  };

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('points', points.toString());
  }, [points]);

  useEffect(() => {
    localStorage.setItem('dailyReport', JSON.stringify(dailyReport));
  }, [dailyReport]);

  // Add this useEffect to detect mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640); // 640px is Tailwind's 'sm' breakpoint
    };
    
    checkMobile(); // Check initially
    window.addEventListener('resize', checkMobile); // Check on resize
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'completeTask' && activeTask) {
        completeTask(activeTask);
      }
    };
  
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [activeTask]);

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

    // Open new timer window if its on desktop
    if (!isMobile) {
      const newTimerWindow = window.open('', task.title, 
        'width=500,height=100,resizable=yes,scrollbars=no,toolbar=no,menubar=no,location=no,status=no'
      );
      setTimerWindow(newTimerWindow);
    }

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
    
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-4 space-y-6">
      <Link href="/" className="flex items-center gap-3 mb-6 hover:opacity-80 transition-opacity">
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-500 text-white">
          <Timer className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold">TaskMaster</h1>
      </Link>
      {/* Task Manager Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-6 h-6" />
            Add Task
          </CardTitle>
        </CardHeader>
        <CardContent>            
        <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-4 mb-6">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Task name"
            className="flex-1 p-2 border rounded"
          />
          <div className="flex gap-4 sm:w-auto w-full">
            <input
              type="number"
              value={newTask.duration}
              onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) })}
              placeholder="Minutes"
              className="w-24 p-2 border rounded"
            />
            <button 
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Add
            </button>
          </div>
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
                className="p-3 sm:p-4 border rounded flex flex-col sm:flex-row sm:items-center justify-between gap-2"
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
                <div className="flex gap-2 justify-end">
                  {task.status === 'pending' && !task.timedOut && (
                    <button
                      onClick={() => startTask(task)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 w-full sm:w-auto"
                    >
                      Start
                    </button>
                  )}
                  {task.status === 'pending' && task.timedOut && (
                    <button
                      onClick={() => completeTask(task)}
                      className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 w-full sm:w-auto"
                    >
                      Mark Complete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-6 h-6" />
            Completed Tasks
          </CardTitle>
        </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {dailyReport.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No completed tasks yet</p>
              ) : (
                dailyReport.map((task, index) => (
                  <div 
                    key={index} 
                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                  >
                    <div className="flex items-center gap-2">
                      {task.onTime ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-500" />
                      )}
                      <span className="font-medium">{task.title}</span>
                      <span className="text-sm text-gray-500">({task.duration} mins)</span>
                    </div>
                    <div className="text-sm">
                      {task.onTime ? (
                        <span className="text-green-600">+{task.pointsEarned} points</span>
                      ) : (
                        <span className="text-red-600">+0 points</span>
                      )}
                    </div>
                  </div>
                ))
              )}
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
            
          </div>
        </CardContent>
      </Card>
    </div>
    
    
  );
}


