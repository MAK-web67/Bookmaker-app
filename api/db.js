module.exports = async (req, res) => {
res.setHeader(‘Access-Control-Allow-Origin’, ‘*’);
res.setHeader(‘Access-Control-Allow-Methods’, ‘POST, OPTIONS’);
res.setHeader(‘Access-Control-Allow-Headers’, ‘Content-Type’);
if (req.method === ‘OPTIONS’) return res.status(200).end();
try {
const b = typeof req.body === ‘string’ ? JSON.parse(req.body) : req.body;
const action = b.action;
const data = b.data;
const U = process.env.SUPABASE_URL;
const K = process.env.SUPABASE_ANON_KEY;
const h = {
‘Content-Type’: ‘application/json’,
‘apikey’: K,
‘Authorization’: ’Bearer ’ + K,
‘Prefer’: ‘return=representation’
};
const g = {
‘apikey’: K,
‘Authorization’: ’Bearer ’ + K
};

```
if (action === 'register') {
  var email = data.email;
  var password = data.password;
  var rd = {
    name: data.name,
    type: data.type,
    city: data.city,
    description: data.description,
    emoji: data.emoji,
    color: data.color,
    lang: data.lang,
    plan: data.plan,
    slug: data.slug,
    menu: data.menu || []
  };
  var chk = await fetch(U + '/rest/v1/accounts?email=eq.' + encodeURIComponent(email) + '&limit=1', { headers: g });
  var existing = await chk.json();
  if (existing && existing.length > 0) {
    return res.status(200).json({ error: 'duplicate' });
  }
  var restoRes = await fetch(U + '/rest/v1/restaurants', {
    method: 'POST', headers: h, body: JSON.stringify(rd)
  });
  var restoData = await restoRes.json();
  var resto = Array.isArray(restoData) ? restoData[0] : restoData;
  if (!resto || !resto.id) {
    return res.status(200).json({ error: 'restaurant_failed', detail: resto });
  }
  var accRes = await fetch(U + '/rest/v1/accounts', {
    method: 'POST', headers: h,
    body: JSON.stringify({ email: email, password: password, restaurant_id: resto.id })
  });
  var accData = await accRes.json();
  var acc = Array.isArray(accData) ? accData[0] : accData;
  return res.status(200).json({ id: acc.id, restaurant_id: resto.id });
}

if (action === 'login') {
  var email = data.email;
  var password = data.password;
  var accRes = await fetch(U + '/rest/v1/accounts?email=eq.' + encodeURIComponent(email) + '&limit=1', { headers: g });
  var accounts = await accRes.json();
  if (!accounts || accounts.length === 0) {
    return res.status(200).json({ error: 'invalid credentials' });
  }
  var account = accounts[0];
  if (account.password !== password) {
    return res.status(200).json({ error: 'invalid credentials' });
  }
  var restoRes = await fetch(U + '/rest/v1/restaurants?id=eq.' + account.restaurant_id + '&limit=1', { headers: g });
  var restos = await restoRes.json();
  var restaurant = restos && restos[0] ? restos[0] : null;
  return res.status(200).json({ account: account, restaurant: restaurant });
}

if (action === 'save_restaurant') {
  var r = await fetch(U + '/rest/v1/restaurants', {
    method: 'POST', headers: h, body: JSON.stringify(data)
  });
  return res.status(200).json(await r.json());
}

if (action === 'update_restaurant') {
  var r = await fetch(U + '/rest/v1/restaurants?id=eq.' + data.id, {
    method: 'PATCH', headers: h, body: JSON.stringify(data)
  });
  return res.status(200).json(await r.json());
}

if (action === 'save_order') {
  var r = await fetch(U + '/rest/v1/orders', {
    method: 'POST', headers: h, body: JSON.stringify(data)
  });
  return res.status(200).json(await r.json());
}

if (action === 'get_orders') {
  var r = await fetch(U + '/rest/v1/orders?restaurant_id=eq.' + data.restaurant_id + '&order=created_at.desc&limit=50', { headers: g });
  return res.status(200).json(await r.json());
}

if (action === 'upload_photo') {
  var filename = data.filename;
  var base64 = data.base64;
  var contentType = data.contentType || 'image/jpeg';
  var buffer = Buffer.from(base64, 'base64');
  var r = await fetch(U + '/storage/v1/object/dish-photos/' + filename, {
    method: 'POST',
    headers: { 'Authorization': 'Bearer ' + K, 'apikey': K, 'Content-Type': contentType, 'x-upsert': 'true' },
    body: buffer
  });
  var result = await r.json();
  return res.status(200).json({ url: U + '/storage/v1/object/public/dish-photos/' + filename, result: result });
}

return res.status(400).json({ error: 'Unknown action: ' + action });
```

} catch (e) {
return res.status(500).json({ error: e.message, stack: e.stack });
}
};
