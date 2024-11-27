'use client';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Timer, CheckCircle, Clock } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Task Master
          </h1>
          <p className="text-xl text-gray-600">
            Stay focused, track time, earn rewards
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Timer className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Time Tracking</h3>
                <p className="text-gray-600">
                  Set time limits for your tasks and track your progress
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Task Management</h3>
                <p className="text-gray-600">
                  Organize your tasks and mark them complete as you go
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Clock className="w-12 h-12 mx-auto text-purple-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Daily Reports</h3>
                <p className="text-gray-600">
                  Track your productivity with detailed daily reports
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white shadow-lg">
          <CardContent className="p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">
                Ready to boost your productivity?
              </h2>
              <p className="text-gray-600 mb-6">
                Start managing your tasks effectively and stay focused on what matters.
              </p>
              <button
                onClick={() => router.push('/tasks')}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
              >
                Get Started
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-12 text-center text-gray-600">
          <p>
            Track your tasks, manage your time, and improve your productivity
            with our simple yet powerful task management system.
          </p>
        </div>
      </div>
    </div>
  );
}