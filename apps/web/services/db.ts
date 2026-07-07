import Dexie, { type Table } from 'dexie';

export interface LocalVisit {
  id: string;
  customer_id: string;
  zrt_officer_id: string;
  purpose: string;
  scheduled_at: string;
  check_in_at?: string;
  check_out_at?: string;
  latitude?: number;
  longitude?: number;
  geo_verified?: boolean;
  notes?: string;
  status: string;
  sync_status: 'PENDING' | 'SYNCED';
}

export interface LocalLead {
  id: string;
  customer_id: string;
  source: string;
  product: string;
  potential_value: number;
  stage: string;
  owner_id: string | null;
  conversion_probability: number;
  priority: string;
  created_at: string;
}

export interface SyncMutation {
  id: string;
  type: 'CREATE_VISIT' | 'CHECK_IN' | 'COMPLETE_VISIT' | 'CREATE_LEAD';
  payload: any;
  timestamp: string;
}

class YellowSenseLocalDb extends Dexie {
  visits!: Table<LocalVisit>;
  leads!: Table<LocalLead>;
  syncQueue!: Table<SyncMutation>;

  constructor() {
    super('YellowSenseLocalDb');
    this.version(1).stores({
      visits: 'id, customer_id, zrt_officer_id, status, sync_status',
      leads: 'id, customer_id, stage',
      syncQueue: 'id, type, timestamp'
    });
  }
}

export const db = new YellowSenseLocalDb();
