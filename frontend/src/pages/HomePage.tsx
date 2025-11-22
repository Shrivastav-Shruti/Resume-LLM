import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import { uploadResume, uploadJobDescription, calculateMatchScore, deleteAllVectors } from '../api/client';
import { MatchScore } from '../../../shared/types';

export default function HomePage() {
  const navigate = useNavigate();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [jobDescFile, setJobDescFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [clearing, setClearing] = useState(false);

  const handleAnalyze = async () => {
    if (!resumeFile || !jobDescFile) {
      setError('Please select both resume and job description files');
      return;
    }

    setLoading(true);
    setAnalyzing(true);
    setError('');
    setMatchScore(null);

    try {
      // Step 1: Upload files
      const [resumeRes, jobDescRes] = await Promise.all([
        uploadResume(resumeFile),
        uploadJobDescription(jobDescFile)
      ]);

      // Store in sessionStorage for chat
      sessionStorage.setItem('resumeId', resumeRes.id);
      sessionStorage.setItem('jobDescriptionId', jobDescRes.id);
      sessionStorage.setItem('resumeData', JSON.stringify(resumeRes));
      sessionStorage.setItem('resumeText', resumeRes.text || '');
      sessionStorage.setItem('jobDescriptionText', jobDescRes.text || '');

      // Step 2: Calculate match score
      const result = await calculateMatchScore(
        resumeRes.text || '',
        jobDescRes.text || '',
        resumeRes.id,
        jobDescRes.id
      );

      setMatchScore(result.matchScore);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setResumeFile(null);
    setJobDescFile(null);
    setMatchScore(null);
    setError('');
  };

  const handleClearAllData = async () => {
    if (!window.confirm('⚠️ This will delete ALL resumes and job descriptions from the vector database. This action cannot be undone. Continue?')) {
      return;
    }

    setClearing(true);
    setError('');

    try {
      await deleteAllVectors();
      
      // Clear local state
      setResumeFile(null);
      setJobDescFile(null);
      setMatchScore(null);
      
      // Clear session storage
      sessionStorage.clear();
      
      alert('✅ All data cleared successfully!');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to clear data');
    } finally {
      setClearing(false);
    }
  };

  return (
    <div className="container">
      {/* Upload Section */}
      <div className="card" style={{ maxWidth: '900px', margin: '40px auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
            Resume Screening Tool
          </h2>
          <button
            onClick={handleClearAllData}
            disabled={clearing}
            style={{
              padding: '8px 16px',
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: clearing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              opacity: clearing ? 0.5 : 1
            }}
            title="Delete all data from vector database"
          >
            {clearing ? '🗑️ Clearing...' : '🗑️ Clear All Data'}
          </button>
        </div>
        
        <p style={{ marginBottom: '32px', color: '#6b7280', lineHeight: '1.6' }}>
          Upload a candidate's resume and a job description to get an AI-powered match analysis.
          You can then chat with the system to ask questions about the candidate.
        </p>

        <FileUpload
          label="Resume (PDF/TXT)"
          onFileSelect={setResumeFile}
        />

        <FileUpload
          label="Job Description (PDF/TXT)"
          onFileSelect={setJobDescFile}
        />

        {error && (
          <div style={{
            padding: '12px',
            background: '#fee2e2',
            color: '#991b1b',
            borderRadius: '6px',
            marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            className="btn btn-primary"
            onClick={handleAnalyze}
            disabled={loading || !resumeFile || !jobDescFile}
            style={{
              flex: 1,
              opacity: loading || !resumeFile || !jobDescFile ? 0.5 : 1,
              cursor: loading || !resumeFile || !jobDescFile ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Analyzing...' : 'Analyze Match'}
          </button>
          
          {matchScore && (
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              style={{ flex: 1 }}
            >
              Reset
            </button>
          )}
        </div>

        {analyzing && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f0f9ff',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
            <p style={{ color: '#0369a1', fontWeight: '500' }}>
              Analyzing resume and job description...
            </p>
            <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>
              This may take a few seconds
            </p>
          </div>
        )}
      </div>

      {/* Match Score Section */}
      {matchScore && (
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto 40px' }}>
          <h2 style={{ marginBottom: '32px', fontSize: '28px', fontWeight: 'bold' }}>
            Match Analysis
          </h2>

          {/* Score Circle */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              border: '12px solid #e5e7eb',
              borderTopColor: matchScore.score > 70 ? '#10b981' : matchScore.score > 50 ? '#f59e0b' : '#ef4444',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#1f2937'
            }}>
              {matchScore.score}%
            </div>
            <p style={{ marginTop: '16px', fontSize: '18px', color: '#6b7280' }}>
              Match Score
            </p>
          </div>

          {/* Strengths */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>
              ✓ Strengths
            </h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              {matchScore.strengths.map((strength, i) => (
                <li key={i} style={{ color: '#4b5563', marginBottom: '8px' }}>{strength}</li>
              ))}
            </ul>
          </div>

          {/* Gaps */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#ef4444' }}>
              ✗ Gaps
            </h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              {matchScore.gaps.map((gap, i) => (
                <li key={i} style={{ color: '#4b5563', marginBottom: '8px' }}>{gap}</li>
              ))}
            </ul>
          </div>

          {/* Insights */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#4f46e5' }}>
              💡 Key Insights
            </h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
              {matchScore.insights.map((insight, i) => (
                <li key={i} style={{ color: '#4b5563', marginBottom: '8px' }}>{insight}</li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/chat')}
              style={{ flex: 1 }}
            >
              💬 Ask Questions About This Candidate
            </button>
            <button
              className="btn btn-secondary"
              onClick={handleReset}
              style={{ flex: 1 }}
            >
              🔄 Analyze Another Resume
            </button>
          </div>
        </div>
      )}

      {/* How it Works */}
      {!matchScore && (
        <div className="card" style={{ maxWidth: '900px', margin: '0 auto' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: '600' }}>
            How it works
          </h3>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.8', color: '#4b5563' }}>
            <li>Upload a resume and job description (PDF or TXT format)</li>
            <li>Our AI analyzes the match and provides a detailed score</li>
            <li>View strengths, gaps, and key insights about the candidate</li>
            <li>Chat with the AI to ask specific questions about the candidate</li>
          </ol>
        </div>
      )}
    </div>
  );
}
