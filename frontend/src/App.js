import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [vendors, setVendors] = useState([]);
  const [filteredVendors, setFilteredVendors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [nextVendorId, setNextVendorId] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [filterOptions, setFilterOptions] = useState({ countries: [], statuses: [] });
  const [stats, setStats] = useState({});

  const [formData, setFormData] = useState({
    company_name: '',
    contact_person: '',
    email: '',
    phone: '',
    street_address: '',
    city: '',
    postal_code: '',
    country: '',
    bank_name: '',
    account_number: '',
    iban: '',
    bic: '',
    documents: {
      gst: null,
      pan: null,
      msme: null
    }
  });

  const [errors, setErrors] = useState({});

  const countries = [
    'India', 'United States', 'United Kingdom', 'Germany', 'France', 
    'Canada', 'Australia', 'Singapore', 'Japan', 'Other'
  ];

  useEffect(() => {
    fetchVendors();
    fetchStats();
  }, []);

  useEffect(() => {
    filterVendors();
  }, [vendors, searchTerm, selectedCountry, selectedStatus]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/vendors`);
      if (response.ok) {
        const data = await response.json();
        setVendors(data.vendors);
        setFilterOptions(data.filter_options);
      }
    } catch (error) {
      console.error('Failed to fetch vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/vendors/stats`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const filterVendors = () => {
    let filtered = vendors;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(vendor => 
        vendor.vendor_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Country filter
    if (selectedCountry) {
      filtered = filtered.filter(vendor => vendor.country === selectedCountry);
    }

    // Status filter
    if (selectedStatus) {
      filtered = filtered.filter(vendor => vendor.status === selectedStatus);
    }

    setFilteredVendors(filtered);
  };

  const fetchNextVendorId = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/next-vendor-id`);
      if (response.ok) {
        const data = await response.json();
        setNextVendorId(data.next_vendor_id);
      }
    } catch (error) {
      console.error('Failed to fetch next vendor ID:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileUpload = (documentType, event) => {
    const file = event.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        documents: {
          ...prev.documents,
          [documentType]: file.name
        }
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1:
        if (!formData.company_name.trim()) newErrors.company_name = 'Company name is required';
        if (!formData.contact_person.trim()) newErrors.contact_person = 'Contact person is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone is required';
        
        // Enhanced email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (formData.email && !emailRegex.test(formData.email)) {
          newErrors.email = 'Please enter a valid email address';
        }
        
        // Enhanced phone validation
        const phoneRegex = /^\+?[\d\s\-\(\)]{7,20}$/;
        if (formData.phone && !phoneRegex.test(formData.phone)) {
          newErrors.phone = 'Please enter a valid phone number';
        }
        break;
        
      case 2:
        if (!formData.street_address.trim()) newErrors.street_address = 'Street address is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.postal_code.trim()) newErrors.postal_code = 'Postal code is required';
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        
        // Enhanced postal code validation
        const postalPatterns = {
          'United States': /^\d{5}(-\d{4})?$/,
          'India': /^\d{6}$/,
          'United Kingdom': /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
          'Canada': /^[A-Z]\d[A-Z]\s?\d[A-Z]\d$/i,
          'Germany': /^\d{5}$/,
          'France': /^\d{5}$/,
        };
        
        if (formData.country && postalPatterns[formData.country] && 
            !postalPatterns[formData.country].test(formData.postal_code)) {
          newErrors.postal_code = `Invalid postal code format for ${formData.country}`;
        }
        break;
        
      case 3:
        if (!formData.bank_name.trim()) newErrors.bank_name = 'Bank name is required';
        if (!formData.account_number.trim()) newErrors.account_number = 'Account number is required';
        if (!formData.iban.trim()) newErrors.iban = 'IBAN is required';
        if (!formData.bic.trim()) newErrors.bic = 'BIC is required';
        
        // Enhanced IBAN validation
        const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/i;
        if (formData.iban && !ibanRegex.test(formData.iban.replace(/\s/g, ''))) {
          newErrors.iban = 'Invalid IBAN format';
        }
        
        // Enhanced BIC validation
        const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/i;
        if (formData.bic && !bicRegex.test(formData.bic)) {
          newErrors.bic = 'Invalid BIC format';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setLoading(true);
    try {
      const url = editingVendor 
        ? `${API_BASE_URL}/api/vendors/${editingVendor.vendor_id}`
        : `${API_BASE_URL}/api/vendors`;
      
      const method = editingVendor ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert(editingVendor ? 'Vendor updated successfully!' : 'Vendor created successfully!');
        resetForm();
        fetchVendors();
        fetchStats();
        setShowForm(false);
      } else {
        const error = await response.json();
        alert(`Failed to ${editingVendor ? 'update' : 'create'} vendor: ${error.detail || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      alert('Error saving vendor');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      company_name: '',
      contact_person: '',
      email: '',
      phone: '',
      street_address: '',
      city: '',
      postal_code: '',
      country: '',
      bank_name: '',
      account_number: '',
      iban: '',
      bic: '',
      documents: {
        gst: null,
        pan: null,
        msme: null
      }
    });
    setCurrentStep(1);
    setErrors({});
    setNextVendorId('');
    setEditingVendor(null);
  };

  const startOnboarding = () => {
    setShowForm(true);
    setEditingVendor(null);
    fetchNextVendorId();
    resetForm();
  };

  const startEditing = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      company_name: vendor.company_name,
      contact_person: vendor.contact_person,
      email: vendor.email,
      phone: vendor.phone,
      street_address: vendor.street_address,
      city: vendor.city,
      postal_code: vendor.postal_code,
      country: vendor.country,
      bank_name: vendor.bank_name,
      account_number: vendor.account_number,
      iban: vendor.iban,
      bic: vendor.bic,
      documents: vendor.documents || { gst: null, pan: null, msme: null }
    });
    setShowForm(true);
  };

  const handleDelete = async (vendorId) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        const response = await fetch(`${API_BASE_URL}/api/vendors/${vendorId}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          alert('Vendor deleted successfully!');
          fetchVendors();
          fetchStats();
        } else {
          alert('Failed to delete vendor');
        }
      } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Error deleting vendor');
      }
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedCountry) params.append('country', selectedCountry);
      if (selectedStatus) params.append('status', selectedStatus);

      const response = await fetch(`${API_BASE_URL}/api/vendors/export/csv?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vendors_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        alert('Failed to export vendors');
      }
    } catch (error) {
      console.error('Error exporting vendors:', error);
      alert('Error exporting vendors');
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCountry('');
    setSelectedStatus('');
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className={`step ${currentStep >= step ? 'active' : ''}`}>
          <div className="step-number">{step}</div>
          <div className="step-label">
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Address'}
            {step === 3 && 'Banking'}
            {step === 4 && 'Documents'}
            {step === 5 && 'Review'}
          </div>
        </div>
      ))}
    </div>
  );

  const renderBasicInfo = () => (
    <div className="form-section">
      <h3>Basic Information</h3>
      {!editingVendor && (
        <div className="vendor-id-display">
          <label>Vendor ID (Auto-generated)</label>
          <div className="vendor-id-value">{nextVendorId}</div>
        </div>
      )}
      
      {editingVendor && (
        <div className="vendor-id-display">
          <label>Vendor ID</label>
          <div className="vendor-id-value">{editingVendor.vendor_id}</div>
        </div>
      )}
      
      <div className="form-grid">
        <div className="form-group">
          <label>Company Name *</label>
          <input
            type="text"
            name="company_name"
            value={formData.company_name}
            onChange={handleInputChange}
            className={errors.company_name ? 'error' : ''}
          />
          {errors.company_name && <span className="error-message">{errors.company_name}</span>}
        </div>

        <div className="form-group">
          <label>Contact Person *</label>
          <input
            type="text"
            name="contact_person"
            value={formData.contact_person}
            onChange={handleInputChange}
            className={errors.contact_person ? 'error' : ''}
          />
          {errors.contact_person && <span className="error-message">{errors.contact_person}</span>}
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={errors.email ? 'error' : ''}
          />
          {errors.email && <span className="error-message">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label>Phone *</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className={errors.phone ? 'error' : ''}
          />
          {errors.phone && <span className="error-message">{errors.phone}</span>}
        </div>
      </div>
    </div>
  );

  const renderAddressInfo = () => (
    <div className="form-section">
      <h3>Address Information</h3>
      <div className="form-grid">
        <div className="form-group full-width">
          <label>Street Address *</label>
          <input
            type="text"
            name="street_address"
            value={formData.street_address}
            onChange={handleInputChange}
            className={errors.street_address ? 'error' : ''}
          />
          {errors.street_address && <span className="error-message">{errors.street_address}</span>}
        </div>

        <div className="form-group">
          <label>City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={errors.city ? 'error' : ''}
          />
          {errors.city && <span className="error-message">{errors.city}</span>}
        </div>

        <div className="form-group">
          <label>Postal Code *</label>
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleInputChange}
            className={errors.postal_code ? 'error' : ''}
          />
          {errors.postal_code && <span className="error-message">{errors.postal_code}</span>}
        </div>

        <div className="form-group full-width">
          <label>Country *</label>
          <select
            name="country"
            value={formData.country}
            onChange={handleInputChange}
            className={errors.country ? 'error' : ''}
          >
            <option value="">Select Country</option>
            {countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
          {errors.country && <span className="error-message">{errors.country}</span>}
        </div>
      </div>
    </div>
  );

  const renderBankingInfo = () => (
    <div className="form-section">
      <h3>Banking Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>Bank Name *</label>
          <input
            type="text"
            name="bank_name"
            value={formData.bank_name}
            onChange={handleInputChange}
            className={errors.bank_name ? 'error' : ''}
          />
          {errors.bank_name && <span className="error-message">{errors.bank_name}</span>}
        </div>

        <div className="form-group">
          <label>Account Number *</label>
          <input
            type="text"
            name="account_number"
            value={formData.account_number}
            onChange={handleInputChange}
            className={errors.account_number ? 'error' : ''}
          />
          {errors.account_number && <span className="error-message">{errors.account_number}</span>}
        </div>

        <div className="form-group">
          <label>IBAN *</label>
          <input
            type="text"
            name="iban"
            value={formData.iban}
            onChange={handleInputChange}
            className={errors.iban ? 'error' : ''}
            placeholder="e.g., GB82 WEST 1234 5698 7654 32"
          />
          {errors.iban && <span className="error-message">{errors.iban}</span>}
        </div>

        <div className="form-group">
          <label>BIC *</label>
          <input
            type="text"
            name="bic"
            value={formData.bic}
            onChange={handleInputChange}
            className={errors.bic ? 'error' : ''}
            placeholder="e.g., DEUTDEFF"
          />
          {errors.bic && <span className="error-message">{errors.bic}</span>}
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="form-section">
      <h3>Document Uploads</h3>
      <div className="document-uploads">
        <div className="document-group">
          <label>GST Certificate</label>
          <div className="file-upload">
            <input
              type="file"
              id="gst"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('gst', e)}
            />
            <label htmlFor="gst" className="upload-button">
              {formData.documents.gst ? formData.documents.gst : 'Choose File'}
            </label>
          </div>
        </div>

        <div className="document-group">
          <label>PAN Card</label>
          <div className="file-upload">
            <input
              type="file"
              id="pan"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('pan', e)}
            />
            <label htmlFor="pan" className="upload-button">
              {formData.documents.pan ? formData.documents.pan : 'Choose File'}
            </label>
          </div>
        </div>

        <div className="document-group">
          <label>MSME Certificate</label>
          <div className="file-upload">
            <input
              type="file"
              id="msme"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => handleFileUpload('msme', e)}
            />
            <label htmlFor="msme" className="upload-button">
              {formData.documents.msme ? formData.documents.msme : 'Choose File'}
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="form-section">
      <h3>Review Information</h3>
      <div className="review-section">
        <div className="review-group">
          <h4>Basic Information</h4>
          <p><strong>Vendor ID:</strong> {editingVendor ? editingVendor.vendor_id : nextVendorId}</p>
          <p><strong>Company:</strong> {formData.company_name}</p>
          <p><strong>Contact:</strong> {formData.contact_person}</p>
          <p><strong>Email:</strong> {formData.email}</p>
          <p><strong>Phone:</strong> {formData.phone}</p>
        </div>

        <div className="review-group">
          <h4>Address</h4>
          <p><strong>Street:</strong> {formData.street_address}</p>
          <p><strong>City:</strong> {formData.city}</p>
          <p><strong>Postal Code:</strong> {formData.postal_code}</p>
          <p><strong>Country:</strong> {formData.country}</p>
        </div>

        <div className="review-group">
          <h4>Banking</h4>
          <p><strong>Bank:</strong> {formData.bank_name}</p>
          <p><strong>Account:</strong> {formData.account_number}</p>
          <p><strong>IBAN:</strong> {formData.iban}</p>
          <p><strong>BIC:</strong> {formData.bic}</p>
        </div>

        <div className="review-group">
          <h4>Documents</h4>
          <p><strong>GST:</strong> {formData.documents.gst || 'Not uploaded'}</p>
          <p><strong>PAN:</strong> {formData.documents.pan || 'Not uploaded'}</p>
          <p><strong>MSME:</strong> {formData.documents.msme || 'Not uploaded'}</p>
        </div>
      </div>
    </div>
  );

  const renderStats = () => (
    <div className="stats-section">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats.total_vendors || 0}</div>
          <div className="stat-label">Total Vendors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.active_vendors || 0}</div>
          <div className="stat-label">Active Vendors</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats.recent_vendors || 0}</div>
          <div className="stat-label">Recent (30 days)</div>
        </div>
      </div>
    </div>
  );

  const renderFilters = () => (
    <div className="filters-section">
      <div className="filters-grid">
        <div className="filter-group">
          <label>Search Vendors</label>
          <input
            type="text"
            placeholder="Search by ID, company, contact, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="filter-group">
          <label>Filter by Country</label>
          <select 
            value={selectedCountry} 
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="">All Countries</option>
            {filterOptions.countries.map(country => (
              <option key={country} value={country}>{country}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-group">
          <label>Filter by Status</label>
          <select 
            value={selectedStatus} 
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            {filterOptions.statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
        
        <div className="filter-actions">
          <button onClick={clearFilters} className="btn-secondary">
            Clear Filters
          </button>
          <button onClick={handleExport} className="btn-secondary">
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );

  if (showForm) {
    return (
      <div className="app">
        <div className="form-container">
          <div className="form-header">
            <h2>{editingVendor ? 'Edit Vendor' : 'Vendor Onboarding'}</h2>
            <button className="close-btn" onClick={() => {setShowForm(false); resetForm();}}>×</button>
          </div>
          
          {renderStepIndicator()}
          
          <div className="form-content">
            {currentStep === 1 && renderBasicInfo()}
            {currentStep === 2 && renderAddressInfo()}
            {currentStep === 3 && renderBankingInfo()}
            {currentStep === 4 && renderDocuments()}
            {currentStep === 5 && renderReview()}
          </div>
          
          <div className="form-actions">
            {currentStep > 1 && (
              <button className="btn-secondary" onClick={handlePrevious}>
                Previous
              </button>
            )}
            
            {currentStep < 5 ? (
              <button className="btn-primary" onClick={handleNext}>
                Next
              </button>
            ) : (
              <button 
                className="btn-primary" 
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Saving...' : (editingVendor ? 'Update Vendor' : 'Create Vendor')}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Vendor Management System</h1>
          <button className="btn-primary" onClick={startOnboarding}>
            + New Vendor
          </button>
        </div>

        {renderStats()}
        {renderFilters()}

        <div className="vendors-grid">
          <div className="vendors-header">
            <h2>
              Vendors ({filteredVendors.length} of {vendors.length})
              {(searchTerm || selectedCountry || selectedStatus) && (
                <span className="filter-indicator">Filtered</span>
              )}
            </h2>
          </div>
          
          {loading ? (
            <div className="loading-state">
              <p>Loading vendors...</p>
            </div>
          ) : filteredVendors.length === 0 ? (
            <div className="empty-state">
              {vendors.length === 0 ? (
                <>
                  <h3>No vendors yet</h3>
                  <p>Start by onboarding your first vendor</p>
                  <button className="btn-primary" onClick={startOnboarding}>
                    Onboard First Vendor
                  </button>
                </>
              ) : (
                <>
                  <h3>No vendors match your search</h3>
                  <p>Try adjusting your filters or search terms</p>
                  <button className="btn-secondary" onClick={clearFilters}>
                    Clear Filters
                  </button>
                </>
              )}
            </div>
          ) : (
            <div className="vendors-list">
              {filteredVendors.map((vendor) => (
                <div key={vendor.id} className="vendor-card">
                  <div className="vendor-header">
                    <h3>{vendor.company_name}</h3>
                    <span className="vendor-id">{vendor.vendor_id}</span>
                  </div>
                  <div className="vendor-details">
                    <p><strong>Contact:</strong> {vendor.contact_person}</p>
                    <p><strong>Email:</strong> {vendor.email}</p>
                    <p><strong>Phone:</strong> {vendor.phone}</p>
                    <p><strong>Location:</strong> {vendor.city}, {vendor.country}</p>
                    <p><strong>Bank:</strong> {vendor.bank_name}</p>
                  </div>
                  <div className="vendor-status">
                    <span className={`status ${vendor.status}`}>{vendor.status}</span>
                    <span className="date">
                      {vendor.updated_at ? 'Updated' : 'Created'}: {' '}
                      {new Date(vendor.updated_at || vendor.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="vendor-actions">
                    <button 
                      className="btn-edit" 
                      onClick={() => startEditing(vendor)}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-delete" 
                      onClick={() => handleDelete(vendor.vendor_id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;