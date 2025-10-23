import { useState, useEffect, useRef } from 'react';
import { Play, Wifi, Download, Upload, Clock, RotateCcw, Share2 } from 'lucide-react';

export default function SpeedTestPage() {
  const [isTestRunning, setIsTestRunning] = useState(false);
  const [testPhase, setTestPhase] = useState('idle'); // idle, ping, download, upload, complete
  const [results, setResults] = useState({
    ping: null,
    download: null,
    upload: null,
    timestamp: null
  });
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [progress, setProgress] = useState(0);
  const [testHistory, setTestHistory] = useState([]);
  const [error, setError] = useState(null);
  
  const speedGaugeRef = useRef(null);
  const animationRef = useRef(null);

  // Load test history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('speedTestHistory');
    if (savedHistory) {
      setTestHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save test history to localStorage
  const saveToHistory = (testResult) => {
    const newHistory = [testResult, ...testHistory].slice(0, 10); // Keep last 10 tests
    setTestHistory(newHistory);
    localStorage.setItem('speedTestHistory', JSON.stringify(newHistory));
  };

  // Simulate speed test phases
  const runSpeedTest = async () => {
    setIsTestRunning(true);
    setError(null);
    setProgress(0);
    setCurrentSpeed(0);
    
    try {
      // Phase 1: Ping Test
      setTestPhase('ping');
      const pingResult = await simulatePingTest();
      
      // Phase 2: Download Test
      setTestPhase('download');
      const downloadResult = await simulateDownloadTest();
      
      // Phase 3: Upload Test
      setTestPhase('upload');
      const uploadResult = await simulateUploadTest();
      
      // Complete
      const finalResults = {
        ping: pingResult,
        download: downloadResult,
        upload: uploadResult,
        timestamp: new Date().toISOString()
      };
      
      setResults(finalResults);
      setTestPhase('complete');
      saveToHistory(finalResults);
      
    } catch (err) {
      setError('Test failed. Please try again.');
      setTestPhase('idle');
    } finally {
      setIsTestRunning(false);
      setProgress(0);
      setCurrentSpeed(0);
    }
  };

  const simulatePingTest = () => {
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        setProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          const ping = Math.floor(Math.random() * 50) + 10; // 10-60ms
          resolve(ping);
        }
      }, 100);
    });
  };

  const simulateDownloadTest = () => {
    return new Promise((resolve) => {
      let progress = 0;
      let currentSpeed = 0;
      const maxSpeed = Math.floor(Math.random() * 80) + 20; // 20-100 Mbps
      
      const interval = setInterval(() => {
        progress += 2;
        currentSpeed = Math.min(maxSpeed, currentSpeed + Math.random() * 10);
        setProgress(progress);
        setCurrentSpeed(currentSpeed);
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve(Math.floor(currentSpeed));
        }
      }, 100);
    });
  };

  const simulateUploadTest = () => {
    return new Promise((resolve) => {
      let progress = 0;
      let currentSpeed = 0;
      const maxSpeed = Math.floor(Math.random() * 40) + 10; // 10-50 Mbps
      
      const interval = setInterval(() => {
        progress += 2;
        currentSpeed = Math.min(maxSpeed, currentSpeed + Math.random() * 8);
        setProgress(progress);
        setCurrentSpeed(currentSpeed);
        
        if (progress >= 100) {
          clearInterval(interval);
          resolve(Math.floor(currentSpeed));
        }
      }, 100);
    });
  };

  const resetTest = () => {
    setTestPhase('idle');
    setResults({ ping: null, download: null, upload: null, timestamp: null });
    setCurrentSpeed(0);
    setProgress(0);
    setError(null);
  };

  const shareResults = () => {
    if (results.download && results.upload && results.ping) {
      const text = `My internet speed: ${results.download} Mbps down, ${results.upload} Mbps up, ${results.ping}ms ping`;
      if (navigator.share) {
        navigator.share({ text });
      } else {
        navigator.clipboard.writeText(text);
        alert('Results copied to clipboard!');
      }
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getPhaseText = () => {
    switch (testPhase) {
      case 'ping': return 'Testing ping...';
      case 'download': return 'Testing download speed...';
      case 'upload': return 'Testing upload speed...';
      case 'complete': return 'Test complete!';
      default: return 'Ready to test';
    }
  };

  const getSpeedGaugeRotation = () => {
    const maxSpeed = 100;
    const rotation = Math.min((currentSpeed / maxSpeed) * 180, 180);
    return rotation;
  };

  return (
    <>
      {/* Google Fonts */}
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital,wght@0,400;1,400&family=Inter:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />

      <div className="min-h-screen bg-gradient-to-b from-[#F5F4F0] to-[#ECEAE7] dark:from-[#1A1A1A] dark:to-[#0F0F0F]">
        {/* Header */}
        <header className="bg-[#FAF9F7] dark:bg-[#1E1E1E] border-b border-[#E0E0E0] dark:border-[#404040] px-6 py-4">
          <div className="max-w-[1200px] mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#8B70F6] rounded-lg flex items-center justify-center">
                <Wifi size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-semibold text-[#121212] dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                Speed Test
              </h1>
            </div>
            <button
              onClick={shareResults}
              disabled={!results.download}
              className="flex items-center gap-2 px-4 py-2 bg-[#8B70F6] hover:bg-[#7E64F2] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-colors duration-150"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </header>

        <main className="px-6 py-8">
          <div className="max-w-[1200px] mx-auto">
            {/* Main Test Section */}
            <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl border border-[#E0E0E0] dark:border-[#404040] p-8 mb-8 shadow-lg">
              <div className="text-center mb-8">
                <h2 
                  className="text-3xl md:text-4xl font-medium text-[#0D0D0D] dark:text-white mb-4"
                  style={{ fontFamily: 'Instrument Serif, serif' }}
                >
                  Internet Speed Test
                </h2>
                <p className="text-[#555555] dark:text-[#C0C0C0] text-lg">
                  {getPhaseText()}
                </p>
              </div>

              {/* Speed Gauge */}
              <div className="relative w-80 h-40 mx-auto mb-8">
                <svg viewBox="0 0 200 100" className="w-full h-full">
                  {/* Gauge background */}
                  <path
                    d="M 20 80 A 80 80 0 0 1 180 80"
                    fill="none"
                    stroke="#E0E0E0"
                    strokeWidth="8"
                    className="dark:stroke-[#404040]"
                  />
                  {/* Gauge progress */}
                  <path
                    d="M 20 80 A 80 80 0 0 1 180 80"
                    fill="none"
                    stroke="#8B70F6"
                    strokeWidth="8"
                    strokeDasharray={`${(getSpeedGaugeRotation() / 180) * 251.3} 251.3`}
                    className="transition-all duration-300"
                  />
                  {/* Needle */}
                  <line
                    x1="100"
                    y1="80"
                    x2={100 + 60 * Math.cos((getSpeedGaugeRotation() - 90) * Math.PI / 180)}
                    y2={80 + 60 * Math.sin((getSpeedGaugeRotation() - 90) * Math.PI / 180)}
                    stroke="#0D0D0D"
                    strokeWidth="3"
                    className="dark:stroke-white transition-all duration-300"
                  />
                  {/* Center dot */}
                  <circle cx="100" cy="80" r="4" fill="#0D0D0D" className="dark:fill-white" />
                </svg>
                
                {/* Speed display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center mt-8">
                  <div className="text-3xl font-bold text-[#0D0D0D] dark:text-white">
                    {currentSpeed.toFixed(1)}
                  </div>
                  <div className="text-sm text-[#666666] dark:text-[#AAAAAA]">Mbps</div>
                </div>
              </div>

              {/* Progress Bar */}
              {isTestRunning && (
                <div className="w-full max-w-md mx-auto mb-8">
                  <div className="bg-[#F0F0F0] dark:bg-[#404040] rounded-full h-2">
                    <div 
                      className="bg-[#8B70F6] h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-center mt-2 text-sm text-[#666666] dark:text-[#AAAAAA]">
                    {progress}%
                  </div>
                </div>
              )}

              {/* Start/Reset Button */}
              <div className="text-center mb-8">
                {testPhase === 'idle' ? (
                  <button
                    onClick={runSpeedTest}
                    disabled={isTestRunning}
                    className="group flex items-center gap-3 px-8 py-4 bg-[#8B70F6] hover:bg-[#7E64F2] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl font-semibold text-lg transition-all duration-150 mx-auto shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Play size={24} className="group-hover:scale-110 transition-transform" />
                    Start Test
                  </button>
                ) : (
                  <button
                    onClick={resetTest}
                    disabled={isTestRunning}
                    className="flex items-center gap-3 px-8 py-4 bg-[#666666] hover:bg-[#555555] disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-2xl font-semibold text-lg transition-all duration-150 mx-auto"
                  >
                    <RotateCcw size={24} />
                    Reset
                  </button>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-center text-red-500 mb-4">
                  {error}
                </div>
              )}

              {/* Results Display */}
              {results.download && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-[#F8F8F8] dark:bg-[#262626] rounded-2xl">
                    <Download size={32} className="text-[#8B70F6] mx-auto mb-3" />
                    <div className="text-2xl font-bold text-[#0D0D0D] dark:text-white mb-1">
                      {results.download}
                    </div>
                    <div className="text-sm text-[#666666] dark:text-[#AAAAAA]">Mbps Download</div>
                  </div>
                  
                  <div className="text-center p-6 bg-[#F8F8F8] dark:bg-[#262626] rounded-2xl">
                    <Upload size={32} className="text-[#8B70F6] mx-auto mb-3" />
                    <div className="text-2xl font-bold text-[#0D0D0D] dark:text-white mb-1">
                      {results.upload}
                    </div>
                    <div className="text-sm text-[#666666] dark:text-[#AAAAAA]">Mbps Upload</div>
                  </div>
                  
                  <div className="text-center p-6 bg-[#F8F8F8] dark:bg-[#262626] rounded-2xl">
                    <Clock size={32} className="text-[#8B70F6] mx-auto mb-3" />
                    <div className="text-2xl font-bold text-[#0D0D0D] dark:text-white mb-1">
                      {results.ping}
                    </div>
                    <div className="text-sm text-[#666666] dark:text-[#AAAAAA]">ms Ping</div>
                  </div>
                </div>
              )}
            </div>

            {/* Test History */}
            {testHistory.length > 0 && (
              <div className="bg-white dark:bg-[#1A1A1A] rounded-3xl border border-[#E0E0E0] dark:border-[#404040] p-8 shadow-lg">
                <h3 className="text-2xl font-semibold text-[#0D0D0D] dark:text-white mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Test History
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E0E0E0] dark:border-[#404040]">
                        <th className="text-left py-3 px-4 text-[#666666] dark:text-[#AAAAAA] font-medium">Date</th>
                        <th className="text-left py-3 px-4 text-[#666666] dark:text-[#AAAAAA] font-medium">Download</th>
                        <th className="text-left py-3 px-4 text-[#666666] dark:text-[#AAAAAA] font-medium">Upload</th>
                        <th className="text-left py-3 px-4 text-[#666666] dark:text-[#AAAAAA] font-medium">Ping</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testHistory.map((test, index) => (
                        <tr key={index} className="border-b border-[#F0F0F0] dark:border-[#333333] hover:bg-[#F8F8F8] dark:hover:bg-[#262626] transition-colors">
                          <td className="py-3 px-4 text-[#0D0D0D] dark:text-white">
                            {formatDate(test.timestamp)}
                          </td>
                          <td className="py-3 px-4 text-[#0D0D0D] dark:text-white font-semibold">
                            {test.download} Mbps
                          </td>
                          <td className="py-3 px-4 text-[#0D0D0D] dark:text-white font-semibold">
                            {test.upload} Mbps
                          </td>
                          <td className="py-3 px-4 text-[#0D0D0D] dark:text-white font-semibold">
                            {test.ping} ms
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-[#FAF9F7] dark:bg-[#1E1E1E] border-t border-[#E0E0E0] dark:border-[#404040] px-6 py-8 mt-16">
          <div className="max-w-[1200px] mx-auto text-center">
            <p className="text-[#666666] dark:text-[#AAAAAA] text-sm">
              © 2024 Speed Test App. Test your internet connection speed with accuracy.
            </p>
          </div>
        </footer>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </>
  );
}