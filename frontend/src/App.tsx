import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Copy, Download, History } from 'lucide-react';
import { motion } from 'framer-motion';
import SummaryTable from './SummaryTable';

function App() {
  const [url, setUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [history, setHistory] = useState(() => {
    const stored = localStorage.getItem('summaryHistory');
    return stored ? JSON.parse(stored) : [];
  });
  const [showHistory, setShowHistory] = useState(false);

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };
  
  const handleSummarize = async () => {
    setSummary('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/summarize', { url });
      setSummary(response.data.summary);
      const newEntry = { url, summary: response.data.summary, timestamp: new Date().toISOString() };
      const updatedHistory = [newEntry, ...history.slice(0, 9)]; // Keep only last 10
      setHistory(updatedHistory);
      localStorage.setItem('summaryHistory', JSON.stringify(updatedHistory));
    } catch (err) {
      if (!isValidUrl(url)) {
        setError('Please enter a valid URL.');
        return;
      }else{
        setError('Failed to fetch summary.');

      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  const handleDownload = () => {
    const blob = new Blob([summary], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'summary.txt';
    link.click();
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat relative"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=1600&q=80')`,
      }}
    >
      {/* Dark overlay with slight blur */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Content wrapper */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12 text-gray-100">
        <div className="bg-white/90 dark:bg-gray-800/90 shadow-2xl rounded-2xl p-8 max-w-2xl w-full backdrop-blur-md">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">
            🌐 AI Content Extractor
          </h1>

          <input
            type="text"
            placeholder="Enter a public URL..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
          />

          <button
            onClick={handleSummarize}
            disabled={loading || !url}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition"
          >
            {loading ? 'Summarizing...' : 'Summarize'}
          </button>

          {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}

          {loading && (
            <div className="mt-6">
              <Skeleton count={5} height={20} baseColor="#ccc" highlightColor="#eee" />
            </div>
          )}

          {summary && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-6 text-left bg-gray-100 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600 relative"
            >
              <input
  type="text"
  placeholder="Search in summary..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  className="mb-3 w-full px-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
/>

              <h2 className="text-xl font-semibold mb-3 flex justify-between items-center text-gray-800 dark:text-gray-100">
                🗒️ Summary
                <div className="space-x-2">
                  <button
                    onClick={handleCopy}
                    className="text-sm px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    <Copy size={16} className="inline mr-1" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                  <button
                    onClick={handleDownload}
                    className="text-sm px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                  >
                    <Download size={16} className="inline mr-1" />
                    Download
                  </button>
                </div>
              </h2>
              <p className="whitespace-pre-wrap text-gray-800 dark:text-gray-100">
  {summary.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) =>
    part.toLowerCase() === searchTerm.toLowerCase() && searchTerm ? (
      <mark key={i} className="bg-yellow-300 dark:bg-yellow-600 px-1 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  )}
</p>
              <div className="text-right text-xs text-gray-500 mt-2">
                {summary.split(/\s+/).length} words | {summary.length} characters
              </div>
            </motion.div>
          )}

          <button
            onClick={() => setShowHistory((prev) => !prev)}
            className="mt-6 text-sm text-blue-300 hover:underline flex items-center"
          >
            <History size={18} className="mr-1" />
            {showHistory ? 'Hide' : 'Show'} History
          </button>

          {showHistory && <SummaryTable data={history} />}

        </div>
      </div>
    </div>
  );
}

export default App;