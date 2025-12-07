import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export interface RFP {
  id: string;
  title: string;
  description?: string;
  requirements: any;
  budget?: number;
  deadline?: string;
  status: string;
  paymentTerms?: string;
  warranty?: string;
  deliveryTerms?: string;
  createdAt: string;
  updatedAt: string;
  proposals?: Proposal[];
}

export interface Vendor {
  id: string;
  name: string;
  email: string;
  contactPerson?: string;
  phone?: string;
  category?: string;
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  rfpId: string;
  vendorId: string;
  status: string;
  rawContent?: string;
  extractedData?: any;
  aiSummary?: string;
  aiScore?: number;
  complianceScore?: number;
  createdAt: string;
  vendor?: Vendor;
}

// RFP APIs
export const rfpApi = {
  createFromText: (text: string) => api.post<{ success: boolean; data: RFP }>('/rfps/create-from-text', { text }),
  create: (data: Partial<RFP>) => api.post<{ success: boolean; data: RFP }>('/rfps', data),
  getAll: () => api.get<{ success: boolean; data: RFP[] }>('/rfps'),
  getById: (id: string) => api.get<{ success: boolean; data: RFP }>(`/rfps/${id}`),
  update: (id: string, data: Partial<RFP>) => api.put<{ success: boolean; data: RFP }>(`/rfps/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/rfps/${id}`),
  sendToVendors: (id: string, vendorIds: string[]) => 
    api.post<{ success: boolean; data: any }>(`/rfps/${id}/send`, { vendorIds }),
  compareProposals: (id: string) => 
    api.get<{ success: boolean; data: any }>(`/rfps/${id}/compare`)
};

// Vendor APIs
export const vendorApi = {
  getAll: () => api.get<{ success: boolean; data: Vendor[] }>('/vendors'),
  getById: (id: string) => api.get<{ success: boolean; data: Vendor }>(`/vendors/${id}`),
  create: (data: Partial<Vendor>) => api.post<{ success: boolean; data: Vendor }>('/vendors', data),
  update: (id: string, data: Partial<Vendor>) => api.put<{ success: boolean; data: Vendor }>(`/vendors/${id}`, data),
  delete: (id: string) => api.delete<{ success: boolean }>(`/vendors/${id}`)
};

// Proposal APIs
export const proposalApi = {
  getAll: () => api.get<{ success: boolean; data: Proposal[] }>('/proposals'),
  getById: (id: string) => api.get<{ success: boolean; data: Proposal }>(`/proposals/${id}`),
  getByRFP: (rfpId: string) => api.get<{ success: boolean; data: Proposal[] }>(`/proposals/rfp/${rfpId}`)
};

export default api;

