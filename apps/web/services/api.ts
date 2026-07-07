import { useDemoStore } from '../stores/demoStore';
import { db as localDb } from './db';

const API_BASE = 'http://localhost:8000/api/v1';

async function getHeaders() {
  const token = useDemoStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export const apiService = {
  // Auth
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login-json`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    useDemoStore.getState().setAccessToken(data.access_token);
    useDemoStore.getState().setActiveUser(data.user);
    return data;
  },

  async fetchUsers() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/auth/users`, { headers });
    return res.json();
  },

  // Customers
  async fetchCustomers(q = '', segment = '', stage = '', sentiment = '') {
    const headers = await getHeaders();
    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (segment) params.append('segment', segment);
    if (stage) params.append('lifecycle_stage', stage);
    if (sentiment) params.append('sentiment', sentiment);

    const res = await fetch(`${API_BASE}/customers?${params.toString()}`, { headers });
    return res.json();
  },

  async fetchCustomerById(id: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/customers/${id}`, { headers });
    if (!res.ok) throw new Error('Customer not found');
    return res.json();
  },

  async fetchCustomerTimeline(id: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/customers/${id}/timeline`, { headers });
    return res.json();
  },

  async fetchCustomerRecommendations(id: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/customers/${id}/recommendations`, { headers });
    return res.json();
  },

  // Visits (ZRT)
  async fetchVisits() {
    const headers = await getHeaders();
    
    // Check if offline
    if (useDemoStore.getState().networkStatus === 'Offline') {
      const localVisits = await localDb.visits.toArray();
      // Fetch synced visits from cache if available or return combined
      return localVisits;
    }
    
    const res = await fetch(`${API_BASE}/visits`, { headers });
    const visits = await res.json();
    
    // Cache locally for offline availability
    await localDb.visits.clear();
    await localDb.visits.bulkPut(visits);
    
    return visits;
  },

  async createVisit(customerId: string, purpose: string, scheduledAt: string) {
    const headers = await getHeaders();
    const body = { customer_id: customerId, purpose, scheduled_at: scheduledAt };
    
    if (useDemoStore.getState().networkStatus === 'Offline') {
      const user = useDemoStore.getState().activeUser;
      const tempId = `temp-visit-${Date.now()}`;
      const newVisit = {
        id: tempId,
        customer_id: customerId,
        zrt_officer_id: user?.id || 'offline-zrt',
        purpose,
        scheduled_at: new Date(scheduledAt).toISOString(),
        status: 'SCHEDULED',
        sync_status: 'PENDING' as const
      };
      await localDb.visits.put(newVisit);
      
      // Enqueue sync mutation
      await localDb.syncQueue.put({
        id: `mutation-visit-${Date.now()}`,
        type: 'CREATE_VISIT',
        payload: body,
        timestamp: new Date().toISOString()
      });
      useDemoStore.getState().setPendingSyncCount(await localDb.syncQueue.count());
      return newVisit;
    }

    const res = await fetch(`${API_BASE}/visits`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async checkInVisit(visitId: string, latitude: number, longitude: number) {
    const headers = await getHeaders();
    const body = { latitude, longitude };

    if (useDemoStore.getState().networkStatus === 'Offline') {
      const visit = await localDb.visits.get(visitId);
      if (visit) {
        visit.check_in_at = new Date().toISOString();
        visit.latitude = latitude;
        visit.longitude = longitude;
        visit.geo_verified = true;
        visit.status = 'IN_PROGRESS';
        visit.sync_status = 'PENDING';
        await localDb.visits.put(visit);
      }
      
      await localDb.syncQueue.put({
        id: `mutation-checkin-${visitId}`,
        type: 'CHECK_IN',
        payload: { visitId, body },
        timestamp: new Date().toISOString()
      });
      useDemoStore.getState().setPendingSyncCount(await localDb.syncQueue.count());
      return visit;
    }

    const res = await fetch(`${API_BASE}/visits/${visitId}/check-in`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async completeVisit(visitId: string, needAssessment: any, notes: string | null) {
    const headers = await getHeaders();
    const body = { need_assessment: needAssessment, notes };

    if (useDemoStore.getState().networkStatus === 'Offline') {
      const visit = await localDb.visits.get(visitId);
      if (visit) {
        visit.check_out_at = new Date().toISOString();
        visit.status = 'COMPLETED';
        visit.notes = notes || undefined;
        visit.sync_status = 'PENDING';
        await localDb.visits.put(visit);
      }
      
      await localDb.syncQueue.put({
        id: `mutation-complete-${visitId}`,
        type: 'COMPLETE_VISIT',
        payload: { visitId, body },
        timestamp: new Date().toISOString()
      });
      useDemoStore.getState().setPendingSyncCount(await localDb.syncQueue.count());
      return { ...visit, need_assessment: needAssessment };
    }

    const res = await fetch(`${API_BASE}/visits/${visitId}/complete`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return res.json();
  },

  // Leads
  async fetchLeads() {
    const headers = await getHeaders();
    
    if (useDemoStore.getState().networkStatus === 'Offline') {
      return localDb.leads.toArray();
    }

    const res = await fetch(`${API_BASE}/leads`, { headers });
    const leads = await res.json();
    
    await localDb.leads.clear();
    await localDb.leads.bulkPut(leads);
    return leads;
  },

  async createLead(customerId: string, source: string, product: string, value: number, ownerId: string | null = null) {
    const headers = await getHeaders();
    const body = { customer_id: customerId, source, product, potential_value: value, owner_id: ownerId };

    if (useDemoStore.getState().networkStatus === 'Offline') {
      const tempId = `temp-lead-${Date.now()}`;
      const newLead = {
        id: tempId,
        customer_id: customerId,
        source,
        product,
        potential_value: value,
        stage: 'New',
        owner_id: ownerId,
        conversion_probability: 85.0,
        priority: 'MEDIUM',
        created_at: new Date().toISOString()
      };
      await localDb.leads.put(newLead);
      
      await localDb.syncQueue.put({
        id: `mutation-create-lead-${Date.now()}`,
        type: 'CREATE_LEAD',
        payload: body,
        timestamp: new Date().toISOString()
      });
      useDemoStore.getState().setPendingSyncCount(await localDb.syncQueue.count());
      return newLead;
    }

    const res = await fetch(`${API_BASE}/leads`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    return res.json();
  },

  async updateLeadStage(leadId: string, stage: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/leads/${leadId}/stage`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ stage })
    });
    return res.json();
  },

  async assignLeadOwner(leadId: string, ownerId: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/leads/${leadId}/assign`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ owner_id: ownerId })
    });
    return res.json();
  },

  // Meetings
  async fetchMeetings() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/meetings`, { headers });
    return res.json();
  },

  async createMeeting(customerId: string, purpose: string, scheduledAt: string, transcript: string | null) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/meetings`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ customer_id: customerId, purpose, scheduled_at: scheduledAt, transcript })
    });
    return res.json();
  },

  async generateMeetingIntelligence(meetingId: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/meetings/${meetingId}/generate-intelligence`, {
      method: 'POST',
      headers
    });
    return res.json();
  },

  // Complaints
  async fetchComplaints() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/complaints`, { headers });
    return res.json();
  },

  async updateComplaint(complaintId: string, status: string, assignedTeam: string | null, escalationLevel: number | null) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/complaints/${complaintId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status, assigned_team: assignedTeam, escalation_level: escalationLevel })
    });
    return res.json();
  },

  // Inbound Queries
  async fetchQueries() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/queries`, { headers });
    return res.json();
  },

  async createQuery(customerId: string, channel: string, text: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/queries`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ customer_id: customerId, source_channel: channel, raw_text: text })
    });
    return res.json();
  },

  // AI Endpoints
  async calculateLeadScore(customerId: string) {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/ai/lead-score`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ customer_id: customerId })
    });
    return res.json();
  },

  // Analytics
  async fetchAnalytics(role: string) {
    const headers = await getHeaders();
    const route = role === 'ZRT_OFFICER' ? 'zrt' : (role === 'RM' ? 'rm' : 'executive');
    const res = await fetch(`${API_BASE}/analytics/${route}`, { headers });
    return res.json();
  },

  // Notifications
  async fetchNotifications() {
    const headers = await getHeaders();
    const res = await fetch(`${API_BASE}/notifications`, { headers });
    return res.json();
  },

  // Audit trail
  async fetchAuditTrail(actor = '', entity = '', action = '') {
    const headers = await getHeaders();
    const params = new URLSearchParams();
    if (actor) params.append('actor', actor);
    if (entity) params.append('entity', entity);
    if (action) params.append('action', action);
    
    const res = await fetch(`${API_BASE}/audit?${params.toString()}`, { headers });
    return res.json();
  },

  // Reset Demo
  async resetDemo() {
    const res = await fetch(`${API_BASE}/auth/reset`, {
      method: 'POST'
    });
    return res.json();
  }
};
