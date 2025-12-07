import { useEffect, useState } from 'react';
import { Users, Plus, Edit, Trash2, Mail, Phone, Tag, User, X, Save } from 'lucide-react';
import { vendorApi, Vendor } from '../services/api';
import './VendorManagement.css';

function VendorManagement() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    contactPerson: '',
    phone: '',
    category: '',
    notes: ''
  });

  useEffect(() => {
    loadVendors();
  }, []);

  const loadVendors = async () => {
    try {
      setLoading(true);
      const response = await vendorApi.getAll();
      setVendors(response.data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setError(null);
      if (editingVendor) {
        await vendorApi.update(editingVendor.id, formData);
      } else {
        await vendorApi.create(formData);
      }
      setShowForm(false);
      setEditingVendor(null);
      setFormData({
        name: '',
        email: '',
        contactPerson: '',
        phone: '',
        category: '',
        notes: ''
      });
      loadVendors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vendor');
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name,
      email: vendor.email,
      contactPerson: vendor.contactPerson || '',
      phone: vendor.phone || '',
      category: vendor.category || '',
      notes: vendor.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vendor?')) {
      return;
    }

    try {
      await vendorApi.delete(id);
      loadVendors();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete vendor');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingVendor(null);
    setFormData({
      name: '',
      email: '',
      contactPerson: '',
      phone: '',
      category: '',
      notes: ''
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="vendor-management">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vendor-management fade-in">
      <div className="vendor-hero">
        <div className="hero-content">
          <div className="hero-icon">
            <Users size={48} />
          </div>
          <h1 className="vendor-title">
            <span className="gradient-text">Vendor Management</span>
          </h1>
          <p className="vendor-subtitle">Manage your vendor network and build strong partnerships</p>
        </div>
        <button
          className="btn btn-primary hero-cta"
          onClick={() => {
            setEditingVendor(null);
            setShowForm(true);
          }}
        >
          <Plus size={20} />
          Add New Vendor
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {showForm && (
        <div className="card vendor-form">
          <div className="form-header-modern">
            <h2 className="form-title-modern">
              {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
            </h2>
            <button
              type="button"
              className="close-btn"
              onClick={handleCancel}
            >
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="vendor-form-content">
            <label>
              Name *
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </label>

            <label>
              Email *
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </label>

            <label>
              Contact Person
              <input
                type="text"
                className="input"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              />
            </label>

            <label>
              Phone
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </label>

            <label>
              Category
              <input
                type="text"
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              />
            </label>

            <label>
              Notes
              <textarea
                className="textarea"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </label>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                <Save size={18} />
                {editingVendor ? 'Update' : 'Create'} Vendor
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="vendors-section">
        <div className="section-header">
          <h2 className="section-title">Your Vendors ({vendors.length})</h2>
        </div>
        <div className="vendors-list">
          {vendors.length === 0 ? (
            <div className="card empty-state-card">
              <div className="empty-state">
                <div className="empty-state-icon">👥</div>
                <h3>No Vendors Yet</h3>
                <p>Start building your vendor network by adding your first vendor. This will help you send RFPs and manage proposals efficiently.</p>
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setEditingVendor(null);
                    setShowForm(true);
                  }}
                >
                  <Plus size={20} />
                  Add Your First Vendor
                </button>
              </div>
            </div>
          ) : (
            vendors.map((vendor, index) => (
              <div 
                key={vendor.id} 
                className="card vendor-card"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="vendor-card-header">
                  <div className="vendor-avatar">
                    {getInitials(vendor.name)}
                  </div>
                  <div className="vendor-info">
                    <h3 className="vendor-name">{vendor.name}</h3>
                    <div className="vendor-email-row">
                      <Mail size={16} />
                      <span>{vendor.email}</span>
                    </div>
                  </div>
                  <div className="vendor-actions">
                    <button
                      className="btn btn-secondary btn-icon"
                      onClick={() => handleEdit(vendor)}
                      title="Edit vendor"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      className="btn btn-danger btn-icon"
                      onClick={() => handleDelete(vendor.id)}
                      title="Delete vendor"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                {(vendor.contactPerson || vendor.phone || vendor.category) && (
                  <div className="vendor-details">
                    {vendor.contactPerson && (
                      <div className="detail-item">
                        <User size={16} />
                        <span>{vendor.contactPerson}</span>
                      </div>
                    )}
                    {vendor.phone && (
                      <div className="detail-item">
                        <Phone size={16} />
                        <span>{vendor.phone}</span>
                      </div>
                    )}
                    {vendor.category && (
                      <div className="detail-item">
                        <Tag size={16} />
                        <span>{vendor.category}</span>
                      </div>
                    )}
                  </div>
                )}
                {vendor.notes && (
                  <div className="vendor-notes">
                    <strong>Notes:</strong>
                    <p>{vendor.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default VendorManagement;

