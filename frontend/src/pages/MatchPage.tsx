import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { calculateMatchScore } from '../api/client';
import { MatchScore } from '../../../shared/types';

export default function MatchPage() {
  const navigate = useNavigate();
  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatchScore = async () => {
      try {
        const resumeText = sessionStorage.getItem('resumeText');
        const jobDescriptionText = sessionStorage.getItem('jobDescriptionText');
        const resumeId = sessionStorage.getItem('resumeId');
        const jobDescriptionId = sessionStorage.getItem('jobDescriptionId');

        if (!resumeText || !jobDescriptionText || !resumeId || !jobDescriptionId) {
          setError('Missing resume or job description data. Please upload files again.');
          navigate('/');
          return;
        }

        const result = await calculateMatchScore(
          resumeText,
          jobDescriptionText,
          resumeId,
          jobDescriptionId
        );

        setMatchScore(result.matchScore);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to calculate match score');
      } finally {
        setLoading(false);
      }
    };

    fetchMatchScore();
  }, [navigate]);

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <p>Calculating match score...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ textAlign: 'center', paddingTop: '100px' }}>
        <p style={{ color: '#dc2626' }}>{error}</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '900px', margin: '40px auto' }}>
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
            borderTopColor: matchScore && matchScore.score > 70 ? '#10b981' : matchScore && matchScore.score > 50 ? '#f59e0b' : '#ef4444',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#1f2937'
          }}>
            {matchScore?.score}%
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
            {matchScore?.strengths.map((strength, i) => (
              <li key={i} style={{ color: '#4b5563' }}>{strength}</li>
            ))}
          </ul>
        </div>

        {/* Gaps */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#ef4444' }}>
            ✗ Gaps
          </h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            {matchScore?.gaps.map((gap, i) => (
              <li key={i} style={{ color: '#4b5563' }}>{gap}</li>
            ))}
          </ul>
        </div>

        {/* Insights */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#4f46e5' }}>
            💡 Key Insights
          </h3>
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
            {matchScore?.insights.map((insight, i) => (
              <li key={i} style={{ color: '#4b5563' }}>{insight}</li>
            ))}
          </ul>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => navigate('/chat')}
          style={{ width: '100%' }}
        >
          Ask Questions About This Candidate
        </button>
      </div>
    </div>
  );
}
