const handler = async (req, res) => {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);
if (req.method === ‘OPTIONS’) return res.status(200).end();

let body;
try {
body = typeof req.body === ‘string’ ? JSON.parse(req.body) : req.body;
} catch(e) {
return res.status(400).json({ error: ‘Invalid JSON’ });
}

const { action, data } = body || {};
const SUPA_URL = process.env.SUPABASE_URL;
const SUPA_KEY = process.env.SUPABASE_ANON_KEY;

const h = {
‘Content-Type’: ‘application/json’,
‘apikey’: SUPA_KEY,
‘Authorization’: ’Bearer ’ + SUPA_KEY,
‘Prefer’: ‘return=representation’
};
const hGet = { ‘apikey’: SUPA_KEY, ‘Authorization’: ’Bearer ’ + SUPA_KEY };

try {

```
// REGISTER
if (action === 'register') {
  const { email, password, ...restoData } = data;

  // Check duplicate email
  const chk = await fetch(SUPA_URL + '/rest/v1/accounts?email=eq.' + encodeURIComponent(email) + '&limit=1', { headers: hGet });
  const existing = await chk.json();
  if (existing && existing.length > 0) {
    return res.status(200).json({ error: 'duplicate email' });
  }

  // Create restaurant first
  const restoRes = await fetch(SUPA_URL + '/rest/v1/restaurants', {
    method: 'POST', headers: h,
    body: JSON.stringify(restoData)
  });
  const restoArr = await restoRes.json();
  const resto = Array.isArray(restoArr) ? restoArr[0] : restoArr;
  if (!resto || !resto.id) {
    return res.status(200).json({ error: 'Restaurant creation failed', detail: resto });
  }

  // Create account linked to restaurant
  const accRes = await fetch(SUPA_URL + '/rest/v1/accounts', {
    method: 'POST', headers: h,
    body: JSON.stringify({ email, password, restaurant_id: resto.id })
  });
  const accArr = await accRes.json();
  const acc = Array.isArray(accArr) ? accArr[0] : accArr;
  return res.status(200).json({ id: acc.id, restaurant_id: resto.id });
}

// LOGIN - fetch by email only, then check password in JS
if (action === 'login') {
  const { email, password } = data;

  const accRes = await fetch(SUPA_URL + '/rest/v1/accounts?email=eq.' + encodeURIComponent(email) + '&limit=1', { headers: hGet });
  const accounts = await accRes.json();

  if (!accounts || accounts.length === 0) {
    return res.status(200).json({ error: 'invalid credentials' });
  }

  const account = accounts[0];

  // Check password
  if (account.password !== password) {
    return res.status(200).json({ error: 'invalid credentials' });
  }

  // Get restaurant
  const restoRes = await fetch(SUPA_URL + '/rest/v1/restaurants?id=eq.' + account.restaurant_id + '&limit=1', { headers: hGet });
  const restos = await restoRes.json();
  const restaurant = restos && restos[0] ? restos[0] : null;

  if (!restaurant) {
    return res.status(200).json({ error: 'restaurant not found' });
  }

  return res.status(200).json({ account, restaurant });
}

// SAVE RESTAURANT
if (action === 'save_restaurant') {
  const r = await fetch(SUPA_URL + '/rest/v1/restaurants', {
    method: 'POST', headers: h, body: JSON.stringify(data)
  });
  return res.status(200).json(await r.json());
}

// UPDATE RESTAURANT
if (action === 'update_restaurant') {
  const r = await fetch(SUPA_URL + '/rest/v1/restaurants?id=eq.' + data.id, {
    method: 'PATCH', headers: h, body: JSON.stringify(data)
  });
  return res.status(200).json(await r.json());
}

// GET RESTAURANT
if (action === 'get_restaurant') {
  const r = await fetch(SUPA_URL + '/rest/v1/restaurants?slug=eq.' + data.slug + '&limit=1', { headers: hGet });
  const result = await r.json();
  return res.status(200).json(result[0] || null);
}

// SAVE ORDER
if (action === 'save_order') {
  const r = await fetch(SUPA_URL + '/rest/v1/orders', {
    method: 'POST', headers: h, body: JSON.stringify(data)
  });
  return res.status(200).json(await r.json());
}

// GET ORDERS
if (action === 'get_orders') {
  const r = await fetch(SUPA_URL + '/rest/v1/orders?restaurant_id=eq.' + data.restaurant_id + '&order=created_at.desc&limit=50', { headers: hGet });
  return res.status(200).json(await r.json());
}

// UPLOAD PHOTO
if (action === 'upload_photo') {
  const { filename, base64, contentType } = data;
  const buffer = Buffer.from(base64, 'base64');
  const r = await fetch(SUPA_URL + '/storage/v1/object/dish-photos/' + filename, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + SUPA_KEY, 'apikey': SUPA_KEY, 'Content-Type': contentType || 'image/jpeg', 'x-upsert': 'true' },
    body: buffer
  });
  const result = await r.json();
  return res.status(200).json({ url: SUPA_URL + '/storage/v1/object/public/dish-photos/' + filename, result });
}

return res.status(400).json({ error: 'Unknown action: ' + action });
```

} catch (error) {
return res.status(500).json({ error: error.message, stack: error.stack });
}
};

module.exports = handler;
