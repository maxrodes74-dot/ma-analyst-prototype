import ChatInterface from '@/components/ChatInterface';
import { Activity } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Medicare Advantage Analyst
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                AI-Powered Plan Analysis & Insights
              </p>
            </div>
            <div className="ml-auto">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Beta
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Coverage Areas</h3>
            <p className="text-2xl font-bold text-blue-600">2 States</p>
            <p className="text-xs text-gray-500 mt-1">Illinois & Florida</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Available Plans</h3>
            <p className="text-2xl font-bold text-blue-600">5 Plans</p>
            <p className="text-xs text-gray-500 mt-1">Multiple carriers</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-blue-100 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">Data Source</h3>
            <p className="text-2xl font-bold text-blue-600">CMS 2025</p>
            <p className="text-xs text-gray-500 mt-1">Medicare landscape</p>
          </div>
        </div>

        {/* Chat Interface */}
        <ChatInterface />

        {/* Footer Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            This is a prototype with sample data. For production use, connect to the full CMS dataset.
          </p>
        </div>
      </div>
    </main>
  );
}
