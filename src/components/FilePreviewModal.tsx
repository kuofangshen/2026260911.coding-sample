import React from 'react';
import { Attachment } from '../types';
import { X, Download, FileText, ExternalLink } from 'lucide-react';
import { formatFileSize } from '../utils';

interface FilePreviewModalProps {
  attachment: Attachment | null;
  onClose: () => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ attachment, onClose }) => {
  if (!attachment) return null;

  const isImage = attachment.fileType.startsWith('image/') || attachment.previewType === 'image';
  const isPdf = attachment.fileType.includes('pdf') || attachment.previewType === 'pdf';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div 
        className="bg-white border-4 border-black w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
        id="file-preview-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-2 border-black bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 border border-black bg-black text-white shrink-0">
              <FileText className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div className="truncate">
              <h3 className="font-serif font-bold text-black truncate text-base">{attachment.fileName}</h3>
              <p className="text-xs font-mono text-neutral-500">
                {formatFileSize(attachment.fileSize)} • 上傳於 {new Date(attachment.uploadedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono">
            <a
              href={attachment.fileUrl}
              target="_blank"
              rel="noreferrer"
              download={attachment.fileName}
              className="btn-mono-secondary text-xs"
              id="btn-download-attachment"
            >
              <Download className="w-3.5 h-3.5" strokeWidth={1.5} />
              <span>下載檔案</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-black hover:bg-black hover:text-white transition-colors duration-100"
              id="btn-close-file-preview"
            >
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-auto p-6 bg-white bg-texture-grid flex items-center justify-center min-h-[360px]">
          {isImage ? (
            <div className="max-w-full max-h-full flex items-center justify-center">
              <img
                src={attachment.fileUrl}
                alt={attachment.fileName}
                className="max-h-[70vh] max-w-full object-contain border-2 border-black bg-white"
                referrerPolicy="no-referrer"
              />
            </div>
          ) : isPdf ? (
            <div className="w-full max-w-2xl bg-white p-8 border-2 border-black text-black">
              <div className="flex items-center justify-between pb-4 border-b-2 border-black mb-6">
                <span className="text-xs font-mono font-bold uppercase tracking-wider bg-black text-white px-2.5 py-1">
                  PDF 技術規範文件
                </span>
                <span className="text-xs text-black font-mono">SPEC-REV-2.0</span>
              </div>
              <h4 className="text-2xl font-serif font-bold mb-3">{attachment.fileName}</h4>
              <p className="text-xs font-serif text-neutral-700 leading-relaxed mb-6">
                此文件包含變壓器與電氣系統技術規範，包含繞組耐溫曲線表、散熱通風孔徑與低噪音基座抗震規範。已通過業主審核。
              </p>
              <div className="p-4 bg-neutral-100 border border-black mb-6 text-xs font-mono space-y-2 text-black">
                <div>[第 1 節] 乾式變壓器絕緣等級：H 級 (180°C 耐溫)</div>
                <div>[第 2 節] 額定電壓：11.4kV / 220V - 380V 三相四線</div>
                <div>[第 3 節] 噪音檢測標準：小於 52 dB(A) 於 1 公尺處</div>
              </div>
              <div className="text-center">
                <a
                  href={attachment.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-mono-primary inline-flex items-center gap-2 font-mono text-xs"
                >
                  <ExternalLink className="w-4 h-4" strokeWidth={1.5} />
                  <span>在新分頁完整檢視原檔</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="text-center p-8 bg-white border-2 border-black max-w-md">
              <FileText className="w-12 h-12 text-black mx-auto mb-3" strokeWidth={1} />
              <p className="font-serif font-bold text-black mb-1">{attachment.fileName}</p>
              <p className="text-xs font-mono text-neutral-600 mb-4">檔案類型：{attachment.fileType || '二進位附件'}</p>
              <a
                href={attachment.fileUrl}
                download={attachment.fileName}
                className="btn-mono-primary inline-flex items-center gap-1.5 font-mono text-xs"
              >
                <Download className="w-4 h-4" strokeWidth={1.5} />
                <span>下載檔案到本機</span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
