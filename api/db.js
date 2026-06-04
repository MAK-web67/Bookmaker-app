module.exports = async function(req, res) {
res.setHeader(“Access-Control-Allow-Origin”, “*”);
res.setHeader(“Access-Control-Allow-Methods”, “POST, OPTIONS”);
res.setHeader(“Access-Control-Allow-Headers”, “Content-Type”);
if (req.method === “OPTIONS”) return res.status(200).end();
try {
var b = req.body || {};
if (typeof b === “string”) b = JSON.parse(b);
var action = b.action;
var data = b.data || {};
var U = process.env.SUPABASE_URL;
var K = process.env.SUPABASE_ANON_KEY;
var h = {“Content-Type”: “application/json”, “apikey”: K, “Authorization”: “Bearer “ + K, “Prefer”: “return=representation”};
var g = {“apikey”: K, “Authorization”: “Bearer “ + K};
if (action === “register”) {
var chk = await fetch(U + “/rest/v1/accounts?email=eq.” + encodeURIComponent(data.email) + “&limit=1”, {headers: g});
var ex = await chk.json();
if (ex && ex.length > 0) return res.json({error: “duplicate”});
var rd = {name: data.name, type: data.type, city: data.city, description: data.description, emoji: data.emoji, color: data.color, lang: data.lang, plan: data.plan, slug: data.slug, menu: data.menu || []};
var rr = await fetch(U + “/rest/v1/restaurants”, {method: “POST”, headers: h, body: JSON.stringify(rd)});
var rd2 = await rr.json();
var resto = Array.isArray(rd2) ? rd2[0] : rd2;
if (!resto || !resto.id) return res.json({error: “restaurant_failed”, detail: JSON.stringify(resto)});
var ar = await fetch(U + “/rest/v1/accounts”, {method: “POST”, headers: h, body: JSON.stringify({email: data.email, password: data.password, restaurant_id: resto.id})});
var ad = await ar.json();
var acc = Array.isArray(ad) ? ad[0] : ad;
return res.json({id: acc.id, restaurant_id: resto.id});
}
if (action === “login”) {
var ar = await fetch(U + “/rest/v1/accounts?email=eq.” + encodeURIComponent(data.email) + “&limit=1”, {headers: g});
var accounts = await ar.json();
if (!accounts || accounts.length === 0) return res.json({error: “invalid credentials”});
var account = accounts[0];
if (account.password !== data.password) return res.json({error: “invalid credentials”});
var rr = await fetch(U + “/rest/v1/restaurants?id=eq.” + account.restaurant_id + “&limit=1”, {headers: g});
var restos = await rr.json();
return res.json({account: account, restaurant: restos && restos[0] ? restos[0] : null});
}
if (action === “save_restaurant”) {
var r = await fetch(U + “/rest/v1/restaurants”, {method: “POST”, headers: h, body: JSON.stringify(data)});
return res.json(await r.json());
}
if (action === “update_restaurant”) {
var r = await fetch(U + “/rest/v1/restaurants?id=eq.” + data.id, {method: “PATCH”, headers: h, body: JSON.stringify(data)});
return res.json(await r.json());
}
if (action === “save_order”) {
var r = await fetch(U + “/rest/v1/orders”, {method: “POST”, headers: h, body: JSON.stringify(data)});
return res.json(await r.json());
}
if (action === “get_orders”) {
var r = await fetch(U + “/rest/v1/orders?restaurant_id=eq.” + data.restaurant_id + “&order=created_at.desc&limit=50”, {headers: g});
return res.json(await r.json());
}
return res.json({error: “unknown action: “ + action});
} catch(e) {
return res.status(500).json({error: e.message, stack: e.stack});
}
};
