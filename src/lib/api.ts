// API configuration and utilities
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
  message: string;
  data?: T;
}

export interface User {
  user_id: string;
  name: string;
  email: string;
  role: string;
}

export interface Household {
  _id: string;
  code: string;
  location: string;
  head_name: string;
  phone?: string;
  created_by: string;
  created_at: string;
}

export interface Patient {
  _id: string;
  household_id: string;
  full_name: string;
  gender: string;
  date_of_birth: string;
  medical_condition?: string;
  risk_level: 'Low' | 'Medium' | 'High';
  created_at: string;
}

export interface Visit {
  _id: string;
  patient_id: string;
  symptoms: string;
  diagnosis?: string;
  medication?: string;
  ai_recommendation?: {
    possible_diagnosis: string;
    follow_up_action: string;
    risk_level: string;
    advice: string;
  };
  follow_up_date?: string;
  notes?: string;
  visit_date: string;
}

export interface DashboardStats {
  total_patients: number;
  total_visits: number;
  total_households: number;
  risk_distribution: Record<string, number>;
  timestamp: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<ApiResponse<User>> {
    return this.request<User>('/users/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    confirm_password: string;
    role?: string;
  }): Promise<ApiResponse<{ user_id: string }>> {
    return this.request('/users/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Households
  async getHouseholds(limit = 100, skip = 0): Promise<ApiResponse<{ households: Household[]; count: number; total: number }>> {
    return this.request(`/households?limit=${limit}&skip=${skip}`);
  }

  async createHousehold(data: {
    code: string;
    location: string;
    head_name: string;
    phone?: string;
    created_by: string;
  }): Promise<ApiResponse<{ household_id: string }>> {
    return this.request('/households', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateHousehold(id: string, data: Partial<Household>): Promise<ApiResponse> {
    return this.request(`/households/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteHousehold(id: string): Promise<ApiResponse> {
    return this.request(`/households/${id}`, {
      method: 'DELETE',
    });
  }

  // Patients
  async getPatients(limit = 100, skip = 0): Promise<ApiResponse<{ patients: Patient[]; count: number; total: number }>> {
    return this.request(`/patients?limit=${limit}&skip=${skip}`);
  }

  async createPatient(data: {
    household_id: string;
    full_name: string;
    gender: string;
    date_of_birth: string;
    medical_condition?: string;
    risk_level?: string;
  }): Promise<ApiResponse<{ patient_id: string }>> {
    return this.request('/patients', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePatient(id: string, data: Partial<Patient>): Promise<ApiResponse> {
    return this.request(`/patients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePatient(id: string): Promise<ApiResponse> {
    return this.request(`/patients/${id}`, {
      method: 'DELETE',
    });
  }

  // Visits
  async getVisits(limit = 100, skip = 0): Promise<ApiResponse<{ visits: Visit[]; count: number; total: number }>> {
    return this.request(`/visits?limit=${limit}&skip=${skip}`);
  }

  async createVisit(data: {
    patient_id: string;
    symptoms: string;
    diagnosis?: string;
    medication?: string;
    follow_up_date?: string;
    notes?: string;
    use_ai?: boolean;
  }): Promise<ApiResponse<{ visit_id: string; ai_recommendation?: any }>> {
    return this.request('/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Analytics
  async getDashboardStats(): Promise<ApiResponse<DashboardStats>> {
    return this.request('/analytics/dashboard');
  }

  async getRecentActivity(limit = 5): Promise<ApiResponse<{ activities: any[] }>> {
    return this.request(`/analytics/recent-activity?limit=${limit}`);
  }

  // AI Assistant
  async getAIRecommendation(data: {
    patient_name: string;
    age: number;
    gender: string;
    condition_history: string;
    symptoms: string;
  }): Promise<ApiResponse> {
    return this.request('/ai/health-recommendation', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAIStatus(): Promise<ApiResponse<{ available: boolean; model: string }>> {
    return this.request('/ai/status');
  }
}

export const api = new ApiClient(API_BASE_URL);
