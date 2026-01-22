import { useState, useRef } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';

export default function FileUpload({ onFileLoad, currentFileName, label = 'Data Source' }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file) => {
    if (!file.name.match(/\.(xlsx|xls)$/i)) {
      setUploadStatus({ type: 'error', message: 'Please upload an Excel file (.xlsx or .xls)' });
      return;
    }

    try {
      setUploadStatus({ type: 'loading', message: 'Processing file...' });

      const buffer = await file.arrayBuffer();
      await onFileLoad(buffer, file.name);

      setUploadStatus({ type: 'success', message: `Loaded: ${file.name}` });

      setTimeout(() => {
        setUploadStatus(null);
      }, 3000);
    } catch (error) {
      console.error('File processing error:', error);
      setUploadStatus({ type: 'error', message: 'Failed to process file. Please ensure it matches the expected format.' });
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="text-base font-semibold text-slate-800">{label}</h3>
        {currentFileName && (
          <p className="text-sm text-slate-500 mt-1 flex items-center space-x-2">
            <FileSpreadsheet className="w-4 h-4" />
            <span className="truncate">{currentFileName}</span>
          </p>
        )}
      </div>
      <div className="card-body">
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex flex-col items-center">
            <div className={`p-4 rounded-full mb-4 ${
              isDragging ? 'bg-blue-100' : 'bg-slate-100'
            }`}>
              <Upload className={`w-8 h-8 ${
                isDragging ? 'text-blue-500' : 'text-slate-400'
              }`} />
            </div>

            <p className="text-sm font-medium text-slate-700">
              Drop Excel file here or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supports .xlsx and .xls files
            </p>
          </div>
        </div>

        {/* Upload Status */}
        {uploadStatus && (
          <div className={`mt-4 flex items-center space-x-2 p-3 rounded-lg ${
            uploadStatus.type === 'success'
              ? 'bg-emerald-50 text-emerald-700'
              : uploadStatus.type === 'error'
              ? 'bg-red-50 text-red-700'
              : 'bg-blue-50 text-blue-700'
          }`}>
            {uploadStatus.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {uploadStatus.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {uploadStatus.type === 'loading' && (
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            )}
            <span className="text-sm font-medium">{uploadStatus.message}</span>
          </div>
        )}

        <p className="text-xs text-slate-400 mt-4 text-center">
          Upload a new Cardamyst Coverage Tracker file to update the dashboard
        </p>
      </div>
    </div>
  );
}
