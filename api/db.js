// v3

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    var b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    var action = b.action;
    var data = b.data;
    var U = process.env.SUPABASE_URL;
    var K = process.env.SUPABASE_ANON_KEY;
    var h = {'Content-Type':'application/json','apikey':K,'Authorization':'Bearer '+K,'Prefer':'return=representation'};
    var g = {'apikey':K,'Authorization':'Bearer '+K};
    if (action === 'register') {
      var email = data.email;
      var password = data.password;
      var rd = {name:data.name,type:data.type,city:data.city,description:data.description,emoji:data.emoji,color:data.color,lang:data.lang,plan:data.plan,slug:data.slug,menu:data.menu||[]};
      var chk = await fetch(U+'/rest/v1/accounts?email=eq.'+encodeURIComponent(email)+'&limit=1',{headers:g});
      var ex = await chk.json();
      if (ex && ex.length > 0) return res.status(200).json({error:'duplicate'});
      var rr = await fetch(U+'/rest/v1/restaurants',{method:'POST',headers:h,body:JSON.stringify(rd)});
      var rd2 = await rr.json();
      var resto = Array.isArray(rd2) ? rd2[0] : rd2;
      if (!resto || !resto.id) return res.status(200).json({error:'restaurant_failed'});
      var ar = await fetch(U+'/rest/v1/accounts',{method:'POST',headers:h,body:JSON.stringify({email:email,password:password,restaurant_id:resto.id})});
      var ad = await ar.json();
      var acc = Array.isArray(ad) ? ad[0] : ad;
      return res.status(200).json({id:acc.id,restaurant_id:resto.id});
    }
    if (action === 'login') {
      var email = data.email;
      var password = data.password;
      var ar = await fetch(U+'/rest/v1/accounts?email=eq.'+encodeURIComponent(email)+'&limit=1',{headers:g});
      var accounts = await ar.json();
      if (!accounts || accounts.length === 0) return res.status(200).json({error:'invalid credentials'});
      var account = accounts[0];
      if (account.password !== password) return res.status(200).json({error:'invalid credentials'});
      var rr = await fetch(U+'/rest/v1/restaurants?id=eq.'+account.restaurant_id+'&limit=1',{headers:g});
      var restos = await rr.json();
      var restaurant = restos && restos[0] ? restos[0] : null;
      return res.status(200).json({account:account,restaurant:restaurant});
    }
    if (action === 'save_restaurant') {
      var r = await fetch(U+'/rest/v1/restaurants',{method:'POST',headers:h,body:JSON.stringify(data)});
      return res.status(200).json(await r.json());
    }
    if (action === 'update_restaurant') {
      var r = await fetch(U+'/rest/v1/restaurants?id=eq.'+data.id,{method:'PATCH',headers:h,body:JSON.stringify(data)});
      return res.status(200).json(await r.json());
    }
    if (action === 'save_order') {
      var r = await fetch(U+'/rest/v1/orders',{method:'POST',headers:h,body:JSON.stringify(data)});
      return res.status(200).json(await r.json());
    }
    if (action === 'get_orders') {
      var r = await fetch(U+'/rest/v1/orders?restaurant_id=eq.'+data.restaurant_id+'&order=created_at.desc&limit=50',{headers:g});
      return res.status(200).json(await r.json());
    }
    return res.status(400).json({error:'unknown action'});
  } catch(e) {
    return res.status(500).json({error:e.message});
  }
};
