// e.g. src/utils/disputeApi.ts
import axios from 'axios';

export async function createDispute(payload: any, token: string) {
  const res = await axios.post(
    'http://localhost:3001/api/disputes',
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return res.data;
}
