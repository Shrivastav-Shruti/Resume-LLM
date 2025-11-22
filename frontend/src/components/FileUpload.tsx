import { useState } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  label: string;
  accept?: string;
}

export default function FileUpload({ onFileSelect, label, accept = '.pdf,.txt' }: FileUploadProps) {
  const [fileName, setFileName] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      onFileSelect(file);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
        {label}
      </label>
      <div style={{
        border: '2px dashed #d1d5db',
        borderRadius: '8px',
        padding: '32px',
        textAlign: 'center',
        background: '#f9fafb'
      }}>
        <input
          type="file"
          id={`file-${label}`}
          accept={accept}
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        <label
          htmlFor={`file-${label}`}
          className="file-upload-label"
        >
          Choose File
        </label>
        {fileName && (
          <p style={{ marginTop: '12px', color: '#6b7280' }}>
            Selected: {fileName}
          </p>
        )}
      </div>
    </div>
  );
}
