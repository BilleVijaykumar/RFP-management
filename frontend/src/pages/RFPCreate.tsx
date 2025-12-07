import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowLeft, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { rfpApi } from '../services/api';
import './RFPCreate.css';

function RFPCreate() {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rfp, setRfp] = useState<any>(null);
  const [mode, setMode] = useState<'chat' | 'form'>('chat');

  const handleCreateFromText = async () => {
    if (!inputText.trim()) {
      setError('Please enter your procurement requirements');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await rfpApi.createFromText(inputText);
      setRfp(response.data);
      setMode('form');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create RFP');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!rfp.title) {
      setError('Title is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await rfpApi.create(rfp);
      navigate(`/rfp/${response.data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save RFP');
    } finally {
      setLoading(false);
    }
  };

  if (mode === 'form' && rfp) {
    return (
      <div className="rfp-create fade-in">
        <div className="form-header">
          <button
            className="btn btn-secondary back-btn"
            onClick={() => setMode('chat')}
          >
            <ArrowLeft size={18} />
            Back
          </button>
          <div>
            <h1 className="form-title">
              <span className="gradient-text">Review & Edit RFP</span>
            </h1>
            <p className="form-subtitle">Review the AI-generated RFP and make any necessary adjustments</p>
          </div>
        </div>
        {error && <div className="error">{error}</div>}

        <div className="card form-card">
          <label>
            Title *
            <input
              type="text"
              className="input"
              value={rfp.title || ''}
              onChange={(e) => setRfp({ ...rfp, title: e.target.value })}
            />
          </label>

          <label>
            Description
            <textarea
              className="textarea"
              value={rfp.description || ''}
              onChange={(e) => setRfp({ ...rfp, description: e.target.value })}
              rows={4}
            />
          </label>

          <label>
            Budget ($)
            <input
              type="number"
              className="input"
              value={rfp.budget || ''}
              onChange={(e) => setRfp({ ...rfp, budget: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
          </label>

          <label>
            Deadline
            <input
              type="date"
              className="input"
              value={rfp.deadline ? new Date(rfp.deadline).toISOString().split('T')[0] : ''}
              onChange={(e) => setRfp({ ...rfp, deadline: e.target.value || undefined })}
            />
          </label>

          <label>
            Payment Terms
            <input
              type="text"
              className="input"
              value={rfp.paymentTerms || ''}
              onChange={(e) => setRfp({ ...rfp, paymentTerms: e.target.value })}
            />
          </label>

          <label>
            Warranty
            <input
              type="text"
              className="input"
              value={rfp.warranty || ''}
              onChange={(e) => setRfp({ ...rfp, warranty: e.target.value })}
            />
          </label>

          <label>
            Delivery Terms
            <input
              type="text"
              className="input"
              value={rfp.deliveryTerms || ''}
              onChange={(e) => setRfp({ ...rfp, deliveryTerms: e.target.value })}
            />
          </label>

          <div className="requirements-section">
            <h3>Requirements</h3>
            {Array.isArray(rfp.requirements) && rfp.requirements.length > 0 ? (
              <div className="requirements-list">
                {rfp.requirements.map((req: any, idx: number) => (
                  <div key={idx} className="requirement-item">
                    <strong>{req.item}</strong>
                    {req.quantity && <span>Quantity: {req.quantity}</span>}
                    {req.specifications && <p>{req.specifications}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p>No requirements extracted</p>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setMode('chat')}
            >
              <ArrowLeft size={18} />
              Back to Chat
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="spinning" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save RFP
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rfp-create fade-in">
      <div className="create-hero">
        <div className="hero-icon">
          <Sparkles size={48} />
        </div>
        <h1 className="create-title">
          <span className="gradient-text">Create RFP with AI</span>
        </h1>
        <p className="create-subtitle">
          Simply describe what you need in natural language. Our AI will transform it into a professional RFP.
        </p>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="card chat-card">
        <div className="ai-badge">
          <Sparkles size={16} />
          <span>AI-Powered</span>
        </div>
        
        <div className="instruction-section">
          <h3 className="instruction-title">How it works</h3>
          <p className="instruction-text">
            Describe your procurement needs in plain English. Include details like items, quantities, budget, deadlines, and any special requirements.
          </p>
        </div>

        <div className="example-box">
          <div className="example-header">
            <span className="example-label">💡 Example</span>
          </div>
          <p className="example-text">
            "I need to procure laptops and monitors for our new office. Budget is $50,000 total. Need delivery within 30 days. We need 20 laptops with 16GB RAM and 15 monitors 27-inch. Payment terms should be net 30, and we need at least 1 year warranty."
          </p>
        </div>

        <div className="chat-interface">
          <div className="chat-input-wrapper">
            <textarea
              className="textarea chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Describe your procurement requirements here... Be as detailed as possible for best results."
              rows={10}
              disabled={loading}
            />
            <div className="input-footer">
              <span className="char-hint">AI will extract all requirements automatically</span>
            </div>
          </div>
          <button
            className="btn btn-primary chat-submit"
            onClick={handleCreateFromText}
            disabled={loading || !inputText.trim()}
          >
            {loading ? (
              <>
                <Loader2 size={20} className="spinning" />
                Processing with AI...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Create RFP
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RFPCreate;

