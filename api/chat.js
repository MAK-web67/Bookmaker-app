export default async function handler(req, res) {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();
if (req.method !== ‘POST’) return res.status(405).json({ error: ‘Method not allowed’ });

try {
const body = typeof req.body === ‘string’ ? JSON.parse(req.body) : req.body;
const { messages, system, action, data } = body;

```
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// Save restaurant
if (action === 'save_restaurant') {
  const r = await fetch(SUPABASE_URL + '/rest/v1/restaurants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  const result = await r.json();
  return res.status(200).json(result);
}

// Get restaurant by slug
if (action === 'get_restaurant') {
  const r = await fetch(SUPABASE_URL + '/rest/v1/restaurants?slug=eq.' + data.slug + '&limit=1', {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    }
  });
  const result = await r.json();
  return res.status(200).json(result[0] || null);
}

// Save order
if (action === 'save_order') {
  const r = await fetch(SUPABASE_URL + '/rest/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  const result = await r.json();
  return res.status(200).json(result);
}

// Get orders for restaurant
if (action === 'get_orders') {
  const r = await fetch(SUPABASE_URL + '/rest/v1/orders?restaurant_id=eq.' + data.restaurant_id + '&order=created_at.desc&limit=50', {
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': 'Bearer ' + SUPABASE_KEY
    }
  });
  const result = await r.json();
  return res.status(200).json(result);
}

// Default - AI chat
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01'
  },
  body: JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    system: system || 'Tu es un assistant restaurant.',
    messages
  })
});

const aiData = await response.json();
return res.status(200).json(aiData);
```

} catch (error) {
return res.status(500).json({ error: error.message });
}
}
