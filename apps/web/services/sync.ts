import { db } from './db';
import { useDemoStore } from '../stores/demoStore';

const API_BASE = 'http://localhost:8000/api/v1';

async function getHeaders() {
  const token = useDemoStore.getState().accessToken;
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
}

export async function synchronizeOfflineQueue(onProgress?: (processed: number, total: number) => void) {
  const queue = await db.syncQueue.orderBy('timestamp').toArray();
  const total = queue.length;
  if (total === 0) return;

  const headers = await getHeaders();
  let processed = 0;

  for (const mutation of queue) {
    try {
      if (mutation.type === 'CREATE_VISIT') {
        await fetch(`${API_BASE}/visits`, {
          method: 'POST',
          headers,
          body: JSON.stringify(mutation.payload)
        });
      } else if (mutation.type === 'CHECK_IN') {
        const { visitId, body } = mutation.payload;
        // Clean temporary ID prefix if it is there
        const realVisitId = visitId.startsWith('temp-') ? visitId : visitId;
        await fetch(`${API_BASE}/visits/${realVisitId}/check-in`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
      } else if (mutation.type === 'COMPLETE_VISIT') {
        const { visitId, body } = mutation.payload;
        await fetch(`${API_BASE}/visits/${visitId}/complete`, {
          method: 'POST',
          headers,
          body: JSON.stringify(body)
        });
      } else if (mutation.type === 'CREATE_LEAD') {
        await fetch(`${API_BASE}/leads`, {
          method: 'POST',
          headers,
          body: JSON.stringify(mutation.payload)
        });
      }

      // Delete from local queue after successful sync
      await db.syncQueue.delete(mutation.id);
      processed++;
      
      if (onProgress) {
        onProgress(processed, total);
      }
      useDemoStore.getState().setPendingSyncCount(await db.syncQueue.count());
    } catch (err) {
      console.error(`Failed to sync mutation ${mutation.id}:`, err);
      // Stop synchronization if we hit network/server errors
      break;
    }
  }
}
