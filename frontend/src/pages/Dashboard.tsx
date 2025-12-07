import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, Plus, TrendingUp, Clock, DollarSign, CheckCircle2, FileEdit, Send } from 'lucide-react';
import { rfpApi, RFP } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [rfps, setRfps] = useState<RFP[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRFPs();
  }, []);

  const loadRFPs = async () => {
    try {
      setLoading(true);
      const response = await rfpApi.getAll();
      setRfps(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load RFPs');
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: rfps.length,
    draft: rfps.filter(r => r.status === 'draft').length,
    sent: rfps.filter(r => r.status === 'sent').length,
    closed: rfps.filter(r => r.status === 'closed').length,
    totalProposals: rfps.reduce((sum, r) => sum + (r.proposals?.length || 0), 0)
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'draft':
        return { color: '#6b7280', bg: '#f3f4f6', icon: FileEdit };
      case 'sent':
        return { color: '#3b82f6', bg: '#dbeafe', icon: Send };
      case 'closed':
        return { color: '#10b981', bg: '#d1fae5', icon: CheckCircle2 };
      default:
        return { color: '#6b7280', bg: '#f3f4f6', icon: FileText };
    }
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-hero">
          <div className="hero-content">
            <h1 className="hero-title">
              <span className="gradient-text">Welcome to RFP Management</span>
            </h1>
            <p className="hero-subtitle">Streamline your procurement process with AI-powered insights</p>
          </div>
        </div>
        <div className="stats-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="stat-card skeleton" style={{ height: '120px' }} />
          ))}
        </div>
        <div className="rfp-list">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rfp-card skeleton" style={{ height: '200px' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard fade-in">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="gradient-text">Welcome to RFP Management</span>
          </h1>
          <p className="hero-subtitle">
            Streamline your procurement process with AI-powered insights and intelligent vendor management
          </p>
          <Link to="/rfp/create" className="btn btn-primary hero-cta">
            <Plus size={20} />
            Create New RFP
          </Link>
        </div>
        <div className="hero-decoration"></div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total RFPs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <FileEdit size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.draft}</div>
            <div className="stat-label">Draft</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <Send size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.sent}</div>
            <div className="stat-label">Sent</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalProposals}</div>
            <div className="stat-label">Total Proposals</div>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      {/* RFP List */}
      <div className="rfp-section">
        <div className="section-header">
          <h2 className="section-title">Your RFPs</h2>
          <Link to="/rfp/create" className="btn btn-secondary">
            <Plus size={18} />
            New RFP
          </Link>
        </div>

        <div className="rfp-list">
          {rfps.length === 0 ? (
            <div className="card empty-state-card">
              <div className="empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>No RFPs Yet</h3>
                <p>Start your procurement journey by creating your first RFP. Our AI will help you structure it perfectly.</p>
                <Link to="/rfp/create" className="btn btn-primary">
                  <Plus size={20} />
                  Create Your First RFP
                </Link>
              </div>
            </div>
          ) : (
            rfps.map((rfp, index) => {
              const statusConfig = getStatusConfig(rfp.status);
              const StatusIcon = statusConfig.icon;
              return (
                <Link 
                  key={rfp.id} 
                  to={`/rfp/${rfp.id}`} 
                  className="rfp-card"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="rfp-card-header">
                    <div className="rfp-title-section">
                      <h2 className="rfp-title">{rfp.title}</h2>
                      <span
                        className="status-badge"
                        style={{ 
                          backgroundColor: statusConfig.bg,
                          color: statusConfig.color
                        }}
                      >
                        <StatusIcon size={14} />
                        {rfp.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                  {rfp.description && (
                    <p className="rfp-description">{rfp.description}</p>
                  )}
                  <div className="rfp-meta">
                    {rfp.budget && (
                      <div className="meta-item">
                        <DollarSign size={16} />
                        <span>${rfp.budget.toLocaleString()}</span>
                      </div>
                    )}
                    {rfp.deadline && (
                      <div className="meta-item">
                        <Clock size={16} />
                        <span>{new Date(rfp.deadline).toLocaleDateString()}</span>
                      </div>
                    )}
                    {rfp.proposals && rfp.proposals.length > 0 && (
                      <div className="meta-item">
                        <FileText size={16} />
                        <span>{rfp.proposals.length} Proposal{rfp.proposals.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                  <div className="rfp-footer">
                    <span className="rfp-date">
                      Created {new Date(rfp.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

