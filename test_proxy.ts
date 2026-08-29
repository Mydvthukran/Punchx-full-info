import { handleNamoidProxy } from './api/_utils/namoid';

const req = {
  method: 'POST',
  url: '/api/namoid-proxy?url=https://punch-x-747dd7.id.namoid.in/v1/oauth/token',
  headers: {
    'content-type': 'application/x-www-form-urlencoded',
    'host': 'localhost:3000'
  },
  query: { url: 'https://punch-x-747dd7.id.namoid.in/v1/oauth/token' },
  body: {
    grant_type: 'authorization_code',
    client_id: 'namoid_client_live_6SHiIOdLuGIBZmiJjC5Iu5KCbqB2QQjd',
    code: 'test_code'
  }
};

const res = {
  setHeader: console.log,
  status: (code: any) => { console.log('STATUS:', code); return res; },
  json: (data: any) => { console.log('JSON:', data); return res; },
  send: (data: any) => { console.log('SEND:', data); return res; },
  end: () => console.log('END')
};

handleNamoidProxy(req as any, res as any).catch(console.error);
