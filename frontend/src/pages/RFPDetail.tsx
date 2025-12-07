import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, TrendingUp, DollarSign, Calendar, FileText, CheckCircle2, FileEdit, Users, Award, AlertCircle } from 'lucide-react';
import { rfpApi, vendorApi, RFP, Vendor } from '../services/api';
import './RFPDetail.css';

function RFPDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rfp, setRfp] = useState<RFP | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparison, setComparison] = useState<any>(null);

  useEffect(() => {
    if (id) {
      loadRFP();
      loadVendors();
    }
  }, [id]);

  const loadRFP = async () => {
    try {
      setLoading(true);
      const response = await rfpApi.getById(id!);
      setRfp(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RFP');
    } finally {
      setLoading(false);
    }
  };

  const loadVendors = async () => {
    try {
      const response = await vendorApi.getAll();
      setVendors(response.data);
    } catch (err) {
      console.error('Failed to load vendors:', err);
    }
  };

  const handleSendToVendors = async () => {
    if (selectedVendors.length === 0) {
      setError('Please select at least one vendor');
      return;
    }

    try {
      setSending(true);
      setError(null);
      await rfpApi.sendToVendors(id!, selectedVendors);
      alert('RFP sent successfully!');
      loadRFP();
      setSelectedVendors([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send RFP');
    } finally {
      setSending(false);
    }
  };

  const handleCompare = async () => {
    try {
      setComparing(true);
      setError(null);
      const response = await rfpApi.compareProposals(id!);
      setComparison(response.data.comparison);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compare proposals');
    } finally {
      setComparing(false);
    }
  };

  const toggleVendor = (vendorId: string) => {
    setSelectedVendors((prev) =>
      prev.includes(vendorId)
        ? prev.filter((id) => id !== vendorId)
        : [...prev, vendorId]
    );
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { color: '#6b7280', bg: '#f3f4f6', icon: FileEdit, label: 'Draft' };
      case 'sent':
        return { color: '#3b82f6', bg: '#dbeafe', icon: Send, label: 'Sent' };
      case 'closed':
        return { color: '#10b981', bg: '#d1fae5', icon: CheckCircle2, label: 'Closed' };
      default:
        return { color: '#6b7280', bg: '#f3f4f6', icon: FileText, label: status };
    }
  };

  if (loading) {
    return (
      <div className="rfp-detail">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading RFP details...</p>
        </div>
      </div>
    );
  }

  if (!rfp) {
    return (
      <div className="rfp-detail">
        <div className="error">
          <AlertCircle size={20} />
          RFP not found
        </div>
      </div>
    );
  }

  const statusConfig = getStatusConfig(rfp.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="rfp-detail fade-in">
      <div className="rfp-detail-header">
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          <ArrowLeft size={18} />
          Back to Dashboard
        </button>
        <div className="header-content">
          <div className="title-section">
            <h1 className="rfp-detail-title">{rfp.title}</h1>
            <span
              className="status-badge-large"
              style={{ 
                backgroundColor: statusConfig.bg,
                color: statusConfig.color
              }}
            >
              <StatusIcon size={18} />
              {statusConfig.label.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* Quick Info Cards */}
      <div className="info-cards-grid">
        {rfp.budget && (
          <div className="info-card">
            <div className="info-card-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
              <DollarSign size={24} />
            </div>
            <div className="info-card-content">
              <div className="info-card-label">Budget</div>
              <div className="info-card-value">${rfp.budget.toLocaleString()}</div>
            </div>
          </div>
        )}
        {rfp.deadline && (
          <div className="info-card">
            <div className="info-card-icon" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
              <Calendar size={24} />
            </div>
            <div className="info-card-content">
              <div className="info-card-label">Deadline</div>
              <div className="info-card-value">{new Date(rfp.deadline).toLocaleDateString()}</div>
            </div>
          </div>
        )}
        {rfp.proposals && (
          <div className="info-card">
            <div className="info-card-icon" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' }}>
              <FileText size={24} />
            </div>
            <div className="info-card-content">
              <div className="info-card-label">Proposals</div>
              <div className="info-card-value">{rfp.proposals.length}</div>
            </div>
          </div>
        )}
      </div>

      <div className="rfp-info card">
        {rfp.description && (
          <div className="info-section">
            <h3 className="section-title">
              <FileText size={20} />
              Description
            </h3>
            <p className="section-content">{rfp.description}</p>
          </div>
        )}

        {(rfp.paymentTerms || rfp.warranty || rfp.deliveryTerms) && (
          <div className="info-section">
            <h3 className="section-title">
              <FileText size={20} />
              Terms & Conditions
            </h3>
            <div className="terms-grid">
              {rfp.paymentTerms && (
                <div className="term-item">
                  <strong>Payment Terms:</strong>
                  <span>{rfp.paymentTerms}</span>
                </div>
              )}
              {rfp.warranty && (
                <div className="term-item">
                  <strong>Warranty:</strong>
                  <span>{rfp.warranty}</span>
                </div>
              )}
              {rfp.deliveryTerms && (
                <div className="term-item">
                  <strong>Delivery Terms:</strong>
                  <span>{rfp.deliveryTerms}</span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="requirements-section">
          <h3 className="section-title">
            <FileText size={20} />
            Requirements
          </h3>
          {Array.isArray(rfp.requirements) && rfp.requirements.length > 0 ? (
            <div className="requirements-grid">
              {rfp.requirements.map((req: any, idx: number) => (
                <div key={idx} className="requirement-card">
                  <div className="requirement-header">
                    <strong className="requirement-item">{req.item}</strong>
                    {req.quantity && (
                      <span className="requirement-qty">Qty: {req.quantity}</span>
                    )}
                  </div>
                  {req.specifications && (
                    <p className="requirement-specs">{req.specifications}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-text">No requirements specified</p>
          )}
        </div>
      </div>

      {rfp.status === 'draft' && (
        <div className="card vendor-send-card">
          <div className="card-header">
            <h2 className="card-title">
              <Users size={24} />
              Send RFP to Vendors
            </h2>
          </div>
          <div className="vendor-selection">
            {vendors.length === 0 ? (
              <div className="empty-vendors">
                <Users size={48} />
                <p>No vendors available.</p>
                <a href="/vendors" className="btn btn-primary">
                  Add Vendors
                </a>
              </div>
            ) : (
              <>
                <div className="vendor-checkbox-list">
                  {vendors.map((vendor) => (
                    <label key={vendor.id} className="vendor-checkbox-modern">
                      <input
                        type="checkbox"
                        checked={selectedVendors.includes(vendor.id)}
                        onChange={() => toggleVendor(vendor.id)}
                      />
                      <div className="vendor-checkbox-content">
                        <span className="vendor-name">{vendor.name}</span>
                        <span className="vendor-email">{vendor.email}</span>
                      </div>
                    </label>
                  ))}
                </div>
                <button
                  className="btn btn-primary send-btn"
                  onClick={handleSendToVendors}
                  disabled={sending || selectedVendors.length === 0}
                >
                  {sending ? (
                    <>
                      <div className="loading-spinner-small"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send to {selectedVendors.length} Vendor{selectedVendors.length !== 1 ? 's' : ''}
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {rfp.proposals && rfp.proposals.length > 0 && (
        <div className="card proposals-card">
          <div className="proposals-header">
            <div>
              <h2 className="card-title">
                <FileText size={24} />
                Proposals ({rfp.proposals.length})
              </h2>
              <p className="card-subtitle">Review and compare vendor proposals</p>
            </div>
            <button
              className="btn btn-primary compare-btn"
              onClick={handleCompare}
              disabled={comparing}
            >
              {comparing ? (
                <>
                  <div className="loading-spinner-small"></div>
                  Comparing...
                </>
              ) : (
                <>
                  <TrendingUp size={20} />
                  Compare & Get AI Recommendation
                </>
              )}
            </button>
          </div>

          {comparison && (
            <div className="comparison-section">
              <div className="recommendation-card">
                <div className="recommendation-header">
                  <Award size={32} />
                  <h3>AI Recommendation</h3>
                </div>
                <div className="recommended-vendor">
                  <strong>{comparison.recommendation.vendorName}</strong>
                </div>
                <p className="recommendation-reasoning">
                  {comparison.recommendation.reasoning}
                </p>
              </div>

              <div className="comparison-table">
                <table>
                  <thead>
                    <tr>
                      <th>Vendor</th>
                      <th>Score</th>
                      <th>Strengths</th>
                      <th>Weaknesses</th>
                      <th>Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.proposals.map((proposal: any) => (
                      <tr key={proposal.vendorId}>
                        <td>{proposal.vendorName}</td>
                        <td>
                          <span className="score-badge">{proposal.score}/100</span>
                        </td>
                        <td>
                          <ul>
                            {proposal.strengths.map((s: string, idx: number) => (
                              <li key={idx}>{s}</li>
                            ))}
                          </ul>
                        </td>
                        <td>
                          <ul>
                            {proposal.weaknesses.map((w: string, idx: number) => (
                              <li key={idx}>{w}</li>
                            ))}
                          </ul>
                        </td>
                        <td>{proposal.summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="proposals-list">
            {rfp.proposals.map((proposal) => (
              <div key={proposal.id} className="proposal-card">
                <div className="proposal-header">
                  <h3>{proposal.vendor?.name || 'Unknown Vendor'}</h3>
                  <span className={`status-badge status-${proposal.status}`}>
                    {proposal.status}
                  </span>
                </div>
                {proposal.extractedData && (
                  <div className="proposal-data">
                    {proposal.extractedData.pricing && (
                      <div>
                        <strong>Pricing:</strong>
                        {proposal.extractedData.pricing.total && (
                          <span> Total: ${proposal.extractedData.pricing.total.toLocaleString()}</span>
                        )}
                      </div>
                    )}
                    {proposal.extractedData.terms && (
                      <div>
                        <strong>Terms:</strong>
                        <pre>{JSON.stringify(proposal.extractedData.terms, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}
                {proposal.aiSummary && (
                  <div className="proposal-summary">
                    <strong>AI Summary:</strong>
                    <p>{proposal.aiSummary}</p>
                  </div>
                )}
                {proposal.aiScore !== undefined && (
                  <div className="proposal-score">
                    <strong>AI Score:</strong> {proposal.aiScore}/100
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RFPDetail;

