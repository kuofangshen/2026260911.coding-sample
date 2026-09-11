import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Eye, 
  Play, 
  RotateCcw, 
  Download, 
  Copy, 
  Check, 
  Smartphone, 
  Tablet, 
  Monitor, 
  Maximize2, 
  Minimize2,
  Terminal,
  Layers
} from 'lucide-react';
import { CODE_TEMPLATES } from '../mockData';
import { Card } from '../types';

interface LiveHtmlEditorProps {
  initialCode?: string;
  cards?: Card[];
  onSaveToCard?: (cardId: string, htmlSnippet: string) => void;
}

export const LiveHtmlEditor: React.FC<LiveHtmlEditorProps> = ({ 
  initialCode, 
  cards = [], 
  onSaveToCard 
}) => {
  const [activeTemplate, setActiveTemplate] = useState<string>(CODE_TEMPLATES[0].id);
  const [htmlCode, setHtmlCode] = useState<string>(initialCode || CODE_TEMPLATES[0].html);
  const [cssCode, setCssCode] = useState<string>(CODE_TEMPLATES[0].css);
  const [jsCode, setJsCode] = useState<string>(CODE_TEMPLATES[0].js);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'js' | 'combined'>('combined');
  
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [copied, setCopied] = useState(false);
  const [consoleLogs, setConsoleLogs] = useState<{ type: 'log' | 'error' | 'warn'; msg: string; time: string }[]>([]);
  const [showConsole, setShowConsole] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>(cards[0]?.id || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Compile full document
  const compileDocument = () => {
    let combined = htmlCode;
    
    if (cssCode.trim()) {
      if (combined.includes('</head>')) {
        combined = combined.replace('</head>', `<style>\n${cssCode}\n</style>\n</head>`);
      } else {
        combined = `<style>\n${cssCode}\n</style>\n` + combined;
      }
    }

    const consoleInterceptor = `
      <script>
        (function() {
          const originalLog = console.log;
          const originalError = console.error;
          const originalWarn = console.warn;
          console.log = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'log', message: args.join(' ') }, '*');
            originalLog.apply(console, args);
          };
          console.error = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'error', message: args.join(' ') }, '*');
            originalError.apply(console, args);
          };
          console.warn = function(...args) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'warn', message: args.join(' ') }, '*');
            originalWarn.apply(console, args);
          };
          window.onerror = function(msg, url, line) {
            window.parent.postMessage({ type: 'CONSOLE_LOG', level: 'error', message: msg + ' (Line ' + line + ')' }, '*');
          };
        })();
      </script>
    `;

    let scriptTag = '';
    if (jsCode.trim()) {
      scriptTag = `<script>\n${jsCode}\n</script>`;
    }

    if (combined.includes('</body>')) {
      combined = combined.replace('</body>', `${consoleInterceptor}\n${scriptTag}\n</body>`);
    } else {
      combined = combined + consoleInterceptor + scriptTag;
    }

    return combined;
  };

  const [renderedSrcDoc, setRenderedSrcDoc] = useState<string>(compileDocument());

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'CONSOLE_LOG') {
        const now = new Date().toLocaleTimeString();
        setConsoleLogs(prev => [
          ...prev.slice(-30),
          { type: event.data.level, msg: event.data.message, time: now }
        ]);
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (autoRefresh) {
      const timer = setTimeout(() => {
        setRenderedSrcDoc(compileDocument());
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [htmlCode, cssCode, jsCode, autoRefresh]);

  const handleManualRun = () => {
    setRenderedSrcDoc(compileDocument());
  };

  const handleTemplateSelect = (templateId: string) => {
    const tmpl = CODE_TEMPLATES.find(t => t.id === templateId);
    if (tmpl) {
      setActiveTemplate(templateId);
      setHtmlCode(tmpl.html);
      setCssCode(tmpl.css);
      setJsCode(tmpl.js);
      setConsoleLogs([]);
      setRenderedSrcDoc(tmpl.html);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([htmlCode], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `project-preview-${Date.now()}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleSaveToCardAction = () => {
    if (!selectedCardId || !onSaveToCard) return;
    onSaveToCard(selectedCardId, htmlCode);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const lineCount = htmlCode.split('\n').length;
  const charCount = htmlCode.length;

  return (
    <div 
      className={`flex flex-col bg-white text-black font-mono ${isFullscreen ? 'fixed inset-0 z-50 p-4 bg-black/90' : 'h-[calc(100vh-80px)] border-2 border-black overflow-hidden'}`}
      id="live-html-studio"
    >
      {/* Top Studio Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-white border-b-2 border-black text-xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 font-mono font-bold text-black uppercase">
            <span className="p-1.5 bg-black text-white">
              <Code2 className="w-4 h-4" strokeWidth={1.5} />
            </span>
            <span>HTML STUDIO (即時編輯與同步預覽)</span>
          </div>

          <div className="h-4 w-[2px] bg-black" />

          {/* Template Switcher */}
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="font-bold text-black uppercase">範本:</span>
            <select
              value={activeTemplate}
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="bg-white text-black border border-black px-2.5 py-1 text-xs focus:outline-none cursor-pointer"
              id="select-code-template"
            >
              {CODE_TEMPLATES.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Center: Viewport switches */}
        <div className="flex items-center border border-black bg-white">
          <button
            onClick={() => setViewport('desktop')}
            className={`flex items-center gap-1 px-3 py-1 font-mono text-xs uppercase transition-colors duration-100 ${viewport === 'desktop' ? 'bg-black text-white font-bold' : 'text-black hover:bg-neutral-100'}`}
            title="桌機解析度 (100%)"
            id="btn-viewport-desktop"
          >
            <Monitor className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>DESKTOP</span>
          </button>
          <button
            onClick={() => setViewport('tablet')}
            className={`flex items-center gap-1 px-3 py-1 font-mono text-xs uppercase border-l border-black transition-colors duration-100 ${viewport === 'tablet' ? 'bg-black text-white font-bold' : 'text-black hover:bg-neutral-100'}`}
            title="平板 (768px)"
            id="btn-viewport-tablet"
          >
            <Tablet className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>TABLET (768PX)</span>
          </button>
          <button
            onClick={() => setViewport('mobile')}
            className={`flex items-center gap-1 px-3 py-1 font-mono text-xs uppercase border-l border-black transition-colors duration-100 ${viewport === 'mobile' ? 'bg-black text-white font-bold' : 'text-black hover:bg-neutral-100'}`}
            title="手機 (375px)"
            id="btn-viewport-mobile"
          >
            <Smartphone className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>MOBILE (375PX)</span>
          </button>
        </div>

        {/* Right action tools */}
        <div className="flex items-center gap-2">
          {/* Synchronous Auto-Refresh toggle */}
          <label className="flex items-center gap-1.5 cursor-pointer text-black select-none mr-1 font-mono text-xs">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="w-3.5 h-3.5 border border-black accent-black"
            />
            <span className="uppercase font-bold">同步即時渲染</span>
          </label>

          {!autoRefresh && (
            <button
              onClick={handleManualRun}
              className="btn-mono-primary text-xs"
              id="btn-manual-run"
            >
              <Play className="w-3.5 h-3.5" strokeWidth={2} /> <span>執行 (RUN)</span>
            </button>
          )}

          <button
            onClick={handleCopyCode}
            className="btn-mono-secondary text-xs"
            title="複製 HTML"
            id="btn-copy-code"
          >
            {copied ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />}
            <span>{copied ? 'COPIED' : 'COPY'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="btn-mono-secondary text-xs"
            title="下載 HTML"
            id="btn-download-html"
          >
            <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span>EXPORT</span>
          </button>

          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="btn-mono-secondary p-1.5"
            title={isFullscreen ? '退出全螢幕' : '全螢幕檢視'}
            id="btn-toggle-fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" strokeWidth={1.5} /> : <Maximize2 className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Main Split Body: Editor on Left, Live Preview on Right */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-white">
        {/* Left Side: Code Editor Workspace */}
        <div className="w-full md:w-1/2 flex flex-col border-b md:border-b-0 md:border-r-2 border-black bg-white">
          {/* Editor Subheader & Tabs */}
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 border-b border-black text-xs font-mono">
            <div className="flex items-center border border-black bg-white">
              <button
                onClick={() => setActiveTab('combined')}
                className={`px-3 py-1 font-bold uppercase transition-colors duration-100 ${activeTab === 'combined' ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'}`}
              >
                HTML5 全文
              </button>
              <button
                onClick={() => setActiveTab('css')}
                className={`px-3 py-1 font-bold uppercase border-l border-black transition-colors duration-100 ${activeTab === 'css' ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'}`}
              >
                CSS 擴充
              </button>
              <button
                onClick={() => setActiveTab('js')}
                className={`px-3 py-1 font-bold uppercase border-l border-black transition-colors duration-100 ${activeTab === 'js' ? 'bg-black text-white' : 'text-black hover:bg-neutral-100'}`}
              >
                JS 腳本
              </button>
            </div>

            <div className="flex items-center gap-3 text-neutral-600 font-mono text-[11px]">
              <span>{lineCount} LINES</span>
              <span>{charCount} CHARS</span>
              <button
                onClick={() => {
                  const tmpl = CODE_TEMPLATES.find(t => t.id === activeTemplate);
                  if (tmpl) {
                    setHtmlCode(tmpl.html);
                    setCssCode(tmpl.css);
                    setJsCode(tmpl.js);
                  }
                }}
                className="hover:underline flex items-center gap-1 font-bold text-black"
                title="重設為預設範本"
              >
                <RotateCcw className="w-3 h-3" strokeWidth={1.5} /> RESET
              </button>
            </div>
          </div>

          {/* Textarea Code Input with Line Numbers */}
          <div className="flex-1 relative flex overflow-hidden font-mono text-xs bg-white">
            {/* Line Numbers */}
            <div className="w-12 py-3 bg-neutral-100 text-neutral-400 text-right pr-2 select-none border-r border-black overflow-hidden shrink-0 font-mono text-[11px]">
              {Array.from({ length: Math.min(lineCount, 500) }).map((_, i) => (
                <div key={i} className="leading-5">{i + 1}</div>
              ))}
            </div>

            {/* Code Input */}
            <div className="flex-1 h-full relative bg-white">
              {activeTab === 'combined' && (
                <textarea
                  value={htmlCode}
                  onChange={(e) => setHtmlCode(e.target.value)}
                  className="w-full h-full p-3 bg-white text-black resize-none font-mono text-xs leading-5 focus:outline-none"
                  spellCheck={false}
                  placeholder="在此輸入 HTML 程式碼..."
                  id="textarea-html-editor"
                />
              )}

              {activeTab === 'css' && (
                <textarea
                  value={cssCode}
                  onChange={(e) => setCssCode(e.target.value)}
                  className="w-full h-full p-3 bg-white text-black resize-none font-mono text-xs leading-5 focus:outline-none"
                  spellCheck={false}
                  placeholder="/* 在此輸入自訂 CSS 樣式，將自動注入預覽 */"
                />
              )}

              {activeTab === 'js' && (
                <textarea
                  value={jsCode}
                  onChange={(e) => setJsCode(e.target.value)}
                  className="w-full h-full p-3 bg-white text-black resize-none font-mono text-xs leading-5 focus:outline-none"
                  spellCheck={false}
                  placeholder="// 在此編寫 JavaScript 邏輯，可在控制台檢視 log"
                />
              )}
            </div>
          </div>

          {/* Bottom Bar for Card Linking */}
          {cards.length > 0 && onSaveToCard && (
            <div className="p-3 bg-neutral-100 border-t-2 border-black flex items-center justify-between text-xs font-mono gap-3">
              <div className="flex items-center gap-2 text-black">
                <Layers className="w-3.5 h-3.5 text-black shrink-0" strokeWidth={1.5} />
                <span className="font-bold uppercase">將成果關聯至卡片:</span>
                <select
                  value={selectedCardId}
                  onChange={(e) => setSelectedCardId(e.target.value)}
                  className="bg-white border border-black text-black px-2 py-1 max-w-[200px] truncate focus:outline-none"
                >
                  {cards.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSaveToCardAction}
                disabled={!selectedCardId}
                className="btn-mono-primary text-xs"
                id="btn-save-to-card"
              >
                {saveSuccess ? <Check className="w-3.5 h-3.5" strokeWidth={2} /> : <Layers className="w-3.5 h-3.5" strokeWidth={1.5} />}
                <span>{saveSuccess ? '已儲存至卡片' : '儲存至指定卡片'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Live HTML Synchronous Preview */}
        <div className="w-full md:w-1/2 flex flex-col bg-white">
          {/* Preview Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-neutral-100 border-b border-black text-xs font-mono">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 font-bold uppercase text-black">
                <Eye className="w-3.5 h-3.5 text-black" strokeWidth={1.5} />
                <span>即時預覽畫布 (SYNCHRONOUS CANVAS)</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-mono border border-black bg-black text-white uppercase font-bold">
                LIVE
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowConsole(!showConsole)}
                className={`flex items-center gap-1 px-2 py-1 border border-black text-xs font-mono uppercase transition-colors duration-100 ${showConsole ? 'bg-black text-white font-bold' : 'bg-white text-black hover:bg-neutral-100'}`}
                id="btn-toggle-console"
              >
                <Terminal className="w-3 h-3" strokeWidth={1.5} />
                <span>CONSOLE ({consoleLogs.length})</span>
              </button>
              
              <button
                onClick={() => {
                  if (iframeRef.current) {
                    iframeRef.current.srcdoc = compileDocument();
                  }
                }}
                className="p-1 text-black hover:bg-neutral-200 border border-black"
                title="重新加載 Frame"
              >
                <RotateCcw className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>

          {/* Iframe Viewport Container */}
          <div className="flex-1 overflow-auto p-4 bg-white bg-texture-grid flex items-center justify-center">
            <div 
              className={`h-full transition-all duration-100 bg-white border-2 border-black flex flex-col ${
                viewport === 'mobile' 
                  ? 'w-[375px] max-h-[667px]' 
                  : viewport === 'tablet' 
                  ? 'w-[768px] max-h-[800px]' 
                  : 'w-full'
              }`}
            >
              {/* Browser Address Bar Minimalist */}
              <div className="px-3 py-1.5 bg-neutral-100 border-b border-black flex items-center justify-between text-[11px] font-mono text-black select-none shrink-0">
                <div className="flex items-center gap-1.5 font-bold uppercase text-[10px]">
                  [PORT: 3000]
                </div>
                <div className="bg-white border border-black px-2 py-0.5 text-[10px] text-black font-mono">
                  preview://localhost:3000/render-view
                </div>
                <span className="font-mono text-[10px] text-black font-bold">
                  {viewport === 'mobile' ? '375×667' : viewport === 'tablet' ? '768×1024' : '100%'}
                </span>
              </div>

              {/* Sandboxed Live Iframe */}
              <iframe
                ref={iframeRef}
                srcDoc={renderedSrcDoc}
                title="Synchronous HTML Preview"
                className="w-full flex-1 border-none bg-white"
                sandbox="allow-scripts allow-modals allow-forms allow-same-origin"
                id="live-preview-iframe"
              />
            </div>
          </div>

          {/* Collapsible Console Drawer */}
          {showConsole && (
            <div className="h-36 bg-neutral-900 border-t-2 border-black flex flex-col text-xs font-mono text-white">
              <div className="flex items-center justify-between px-3 py-1.5 bg-black border-b border-neutral-800 text-[11px] text-neutral-300">
                <div className="flex items-center gap-1.5 font-bold uppercase">
                  <Terminal className="w-3.5 h-3.5" strokeWidth={1.5} />
                  <span>預覽容器控制台 (CONSOLE LOGS)</span>
                </div>
                <button
                  onClick={() => setConsoleLogs([])}
                  className="hover:underline text-[10px] uppercase font-bold"
                >
                  CLEAR
                </button>
              </div>
              <div className="flex-1 overflow-auto p-2 space-y-1">
                {consoleLogs.length === 0 ? (
                  <div className="text-neutral-500 italic">尚無 Console 輸出訊息...</div>
                ) : (
                  consoleLogs.map((log, index) => (
                    <div 
                      key={index}
                      className={`leading-relaxed ${
                        log.type === 'error' 
                          ? 'text-white bg-black border border-white px-1 font-bold' 
                          : 'text-neutral-200'
                      }`}
                    >
                      <span className="text-neutral-500 mr-2">[{log.time}]</span>
                      <span>{log.msg}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
