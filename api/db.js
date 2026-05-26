const handler = async (req, res) => {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);

if (req.method === ‘OPTIONS’) return res.status(200).end();

const body = typeof req.body === ‘string’ ? JSON.parse(req.body) : req.body;
const { action, data } = body || {};

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_ANON_KEY;

try {
// Upload photo
if (action === ‘upload_photo’) {
const { filename, base64, contentType } = data;
const buffer = Buffer.from(base64, ‘base64’);
const r = await fetch(URL + ‘/storage/v1/object/dish-photos/’ + filename, {
method: ‘POST’,
headers: {
‘Authorization’: ’Bearer ’ + KEY,
‘apikey’: KEY,
‘Content-Type’: contentType || ‘image/jpeg’,
‘x-upsert’: ‘true’
},
body: buffer
});
const result = await r.json();
const publicUrl = URL + ‘/storage/v1/object/public/dish-photos/’ + filename;
return res.status(200).json({ url: publicUrl, result });
}

```
// Save restaurant
if (action === 'save_restaurant') {
  const r = await fetch(URL + '/rest/v1/restaurants', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': 'Bearer ' + KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  const result = await r.json();
  return res.status(200).json(result);
}

// Update restaurant
if (action === 'update_restaurant') {
  const r = await fetch(URL + '/rest/v1/restaurants?slug=eq.' + data.slug, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': 'Bearer ' + KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  const result = await r.json();
  return res.status(200).json(result);
}

// Get restaurant by slug
if (action === 'get_restaurant') {
  const r = await fetch(URL + '/rest/v1/restaurants?slug=eq.' + data.slug + '&limit=1', {
    headers: {
      'apikey': KEY,
      'Authorization': 'Bearer ' + KEY
    }
  });
  const result = await r.json();
  return res.status(200).json(result[0] || null);
}

// Save order
if (action === 'save_order') {
  const r = await fetch(URL + '/rest/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': KEY,
      'Authorization': 'Bearer ' + KEY,
      'Prefer': 'return=representation'
    },
    body: JSON.stringify(data)
  });
  const result = await r.json();
  return res.status(200).json(result);
}

// Get orders
if (action === 'get_orders') {
  const r = await fetch(URL + '/rest/v1/orders?restaurant_id=eq.' + data.restaurant_id + '&order=created_at.desc&limit=50', {
    headers: {
      'apikey': KEY,
      'Authorization': 'Bearer ' + KEY
    }
  });
  const result = await r.json();
  return res.status(200).json(result);
}

return res.status(400).json({ error: 'Unknown action' });
```

} catch (error) {
return res.status(500).json({ error: error.message });
}
};

module.exports = handler;
