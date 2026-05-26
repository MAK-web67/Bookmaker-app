module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const { action, data } = req.body || {};
  const URL = process.env.SUPABASE_URL;
  const KEY = process.env.SUPABASE_ANON_KEY;

  const endpoints = {
    save_restaurant: { method: 'POST', path: '/rest/v1/restaurants' },
    get_restaurant: { method: 'GET', path: '/rest/v1/restaurants?slug=eq.' + (data && data.slug) + '&limit=1' },
    save_order: { method: 'POST', path: '/rest/v1/orders' },
    get_orders: { method: 'GET', path: '/rest/v1/orders?restaurant_id=eq.' + (data && data.restaurant_id) }
  };

  const ep = endpoints[action];
  if (!ep) return res.status(400).json({ error: 'Unknown action' });

  const r = await fetch(URL + ep.path, {
    method: ep.method,
    headers: {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': 'Bearer ' + KEY,
      'Prefer': 'return=representation'
    },
    body: ep.method === 'POST' ? JSON.stringify(data) : undefined
  });

  const result = await r.json();
  res.status(200).json(result);
};
