import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Download,
  Github,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  X,
  Copy,
  Check,
  Info,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { Language } from '../types';

interface ApkDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang?: Language;
}

export const ApkDownloadModal: React.FC<ApkDownloadModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'download' | 'instructions' | 'github'>('download');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Default GitHub repository URL and release link
  const [githubRepoUrl, setGithubRepoUrl] = useState('https://github.com/ksepada12/Torres-Capitol-College-SIS');
  
  const apkDownloadUrl = `${githubRepoUrl.replace(/\/$/, '')}/releases/latest/download/Torres-Capitol-College-SIS.apk`;
  const releasesPageUrl = `${githubRepoUrl.replace(/\/$/, '')}/releases`;

  useEffect(() => {
    if (isOpen) {
      QRCode.toDataURL(apkDownloadUrl, {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch((err) => console.error('Failed to generate QR code', err));
    }
  }, [isOpen, apkDownloadUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(apkDownloadUrl);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const gitTagCommand = `git tag -a v1.0.0 -m "Release v1.0.0 with Android APK" && git push origin v1.0.0`;
  const handleCopyCmd = () => {
    navigator.clipboard.writeText(gitTagCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-slate-900 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Download Android APK
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  Ready for GitHub Release
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Torres Capitol College Student Information System Mobile App
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-900/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('download')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'download'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Direct APK & QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'instructions'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>How to Install on Phone</span>
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'github'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Github className="w-3.5 h-3.5" />
            <span>GitHub Actions & CI Guide</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-300 text-xs">
          {activeTab === 'download' && (
            <div className="space-y-6">
              {/* Main Download Card */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center bg-slate-950/60 p-5 rounded-2xl border border-slate-800">
                {/* QR Code Section */}
                <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-lg border border-slate-200">
                  {qrCodeDataUrl ? (
                    <img
                      src={qrCodeDataUrl}
                      alt="Scan to download Torres Capitol College SIS APK"
                      className="w-44 h-44 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="w-44 h-44 flex items-center justify-center text-slate-400">
                      <QrCode className="w-12 h-12 animate-pulse" />
                    </div>
                  )}
                  <p className="mt-2 text-[10px] font-medium text-slate-700 text-center flex items-center space-x-1">
                    <Smartphone className="w-3 h-3 text-blue-600 inline" />
                    <span>Scan with Android Camera</span>
                  </p>
                </div>

                {/* Download Actions */}
                <div className="md:col-span-7 space-y-3.5">
                  <div>
                    <h4 className="text-sm font-bold text-white mb-1">
                      Torres-Capitol-College-SIS.apk
                    </h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Stand-alone Android package configured with Capacitor runtime, camera permissions for QR scanning, and full offline gradebook caching.
                    </p>
                  </div>

                  {/* Metadata Specs */}
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Package ID</span>
                      <span className="font-mono text-slate-200 font-semibold truncate block">
                        edu.torrescapitolcollege.sis
                      </span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Target Android</span>
                      <span className="font-semibold text-slate-200">Android 7.0 - 14+ (API 24-34)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Architecture</span>
                      <span className="font-semibold text-slate-200">Universal (ARM64, x86_64)</span>
                    </div>
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block">Format</span>
                      <span className="font-semibold text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready Signed APK</span>
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <a
                      href={apkDownloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center space-x-2 transition"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download APK Now</span>
                    </a>

                    <a
                      href={releasesPageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs rounded-xl border border-slate-700 flex items-center justify-center space-x-2 transition"
                    >
                      <Github className="w-4 h-4" />
                      <span>View GitHub Releases</span>
                    </a>
                  </div>

                  {/* Copy Link */}
                  <button
                    onClick={handleCopyLink}
                    className="w-full py-1.5 px-3 bg-slate-900/80 hover:bg-slate-900 text-slate-400 hover:text-slate-200 text-[11px] rounded-lg border border-slate-800 flex items-center justify-center space-x-1.5 transition"
                  >
                    {copiedUrl ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span className="text-emerald-400">Direct APK Download Link Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy Direct APK Download Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Repository Customization helper */}
              <div className="p-3.5 bg-slate-950/40 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center space-x-2 truncate">
                  <Github className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-[11px] text-slate-400">Release Repo:</span>
                  <input
                    type="text"
                    value={githubRepoUrl}
                    onChange={(e) => setGithubRepoUrl(e.target.value)}
                    placeholder="https://github.com/your-username/your-repo"
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs px-2.5 py-1 rounded-lg focus:outline-none focus:border-blue-500 w-64 font-mono"
                  />
                </div>
                <span className="text-[10px] text-slate-500 hidden sm:inline">
                  Syncs direct download button with your GitHub repository
                </span>
              </div>
            </div>
          )}

          {activeTab === 'instructions' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-blue-950/30 border border-blue-900/50 rounded-xl flex items-start space-x-3 text-blue-300">
                <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold text-white block mb-0.5">
                    Safe Manual Sideloading
                  </span>
                  Torres Capitol College SIS is distributed directly as an APK so campus personnel and students can install updates immediately without waiting for store reviews.
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs border border-blue-500/30">
                    1
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-xs">Download the APK file</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Click the <strong>Download APK</strong> button on your phone or scan the QR code with your camera.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs border border-blue-500/30">
                    2
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-xs">Tap “Download Anyway”</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Android will display a standard warning for manual APK downloads (<em>“File might be harmful”</em>). Tap <strong>Download anyway</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 font-bold flex items-center justify-center shrink-0 text-xs border border-blue-500/30">
                    3
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-xs">Allow “Install Unknown Apps” (If prompted)</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      If prompted, tap <strong>Settings</strong> and toggle on <strong>Allow from this source</strong> for your browser (Chrome/Samsung Internet) or Files manager.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                  <span className="w-6 h-6 rounded-full bg-emerald-600/30 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-xs border border-emerald-500/30">
                    4
                  </span>
                  <div>
                    <h5 className="font-bold text-white text-xs">Tap “Install” and Open</h5>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      Tap <strong>Install</strong>. Once complete, tap <strong>Open</strong> to start Torres Capitol College SIS on your device!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2 text-white font-bold text-xs">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Automated GitHub Release Pipeline Included</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  We have configured a complete GitHub Actions workflow in <code className="text-blue-400 bg-slate-900 px-1.5 py-0.5 rounded font-mono">.github/workflows/build-and-release-apk.yml</code>. Whenever you create a release or push a tag, GitHub automatically builds the APK and uploads it to GitHub Releases!
                </p>
              </div>

              {/* Quick Git Command */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Method 1: Trigger Release with Git Tag
                </label>
                <div className="relative">
                  <pre className="p-3 bg-slate-950 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
                    {gitTagCommand}
                  </pre>
                  <button
                    onClick={handleCopyCmd}
                    className="absolute top-2 right-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] flex items-center space-x-1 border border-slate-700 transition"
                  >
                    {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>

              {/* Method 2: Manual Trigger */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-2">
                <h5 className="font-bold text-white text-xs">Method 2: 1-Click Manual Trigger in GitHub</h5>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-400">
                  <li>Go to your GitHub repository and click the <strong>Actions</strong> tab.</li>
                  <li>In the sidebar, select <strong>Build & Release Android APK</strong>.</li>
                  <li>Click <strong>Run workflow</strong> → choose <strong>release</strong> → click <strong>Run workflow</strong>.</li>
                  <li>GitHub will build the APK and publish the release with <code className="text-white">Torres-Capitol-College-SIS.apk</code> ready for direct download!</li>
                </ol>
              </div>

              {/* Local Build Command */}
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5">
                <h5 className="font-bold text-white text-xs">Method 3: Build Locally via Terminal</h5>
                <pre className="p-2.5 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300">
                  npm run build:apk && cd android && ./gradlew assembleRelease
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-[11px]">
          <div className="flex items-center space-x-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Capacitor 6 Android Bridge • Offline Cache Ready</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
