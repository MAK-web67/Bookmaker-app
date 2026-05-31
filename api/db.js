module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  try {
    const b = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { action, data } = b || {};
    const U = process.env.SUPABASE_URL;
    const K = process.env.SUPABASE_ANON_KEY;
    const h = {'Content-Type':'application/json','apikey':K,'Authorization':'Bearer '+K,'Prefer':'return=representation'};
    const g = {'apikey':K,'Authorization':'Bearer '+K};
    if(action==='register'){
      const {email,password,...rd}=data;
      const c=await(await fetch(U+'/rest/v1/accounts?email=eq.'+encodeURIComponent(email)+'&limit=1',{headers:g})).json();
      if(c&&c.length>0)return res.json({error:'duplicate'});
      const r=await(await fetch(U+'/rest/v1/restaurants',{method:'POST',headers:h,body:JSON.stringify(rd)})).json();
      const rid=Array.isArray(r)?r[0].id:r.id;
      const a=await(await fetch(U+'/rest/v1/accounts',{method:'POST',headers:h,body:JSON.stringify({email,password,restaurant_id:rid})})).json();
      return res.json(Array.isArray(a)?a[0]:a);
    }
    if(action==='login'){
      const {email,password}=data;
      const a=await(await fetch(U+'/rest/v1/accounts?email=eq.'+encodeURIComponent(email)+'&limit=1',{headers:g})).json();
      if(!a||!a[0])return res.json({error:'invalid'});
      if(a[0].password!==password)return res.json({error:'invalid'});
      const r=await(await fetch(U+'/rest/v1/restaurants?id=eq.'+a[0].restaurant_id+'&limit=1',{headers:g})).json();
      return res.json({account:a[0],restaurant:r&&r[0]?r[0]:null});
    }
    if(action==='save_restaurant'){const r=await(await fetch(U+'/rest/v1/restaurants',{method:'POST',headers:h,body:JSON.stringify(data)})).json();return res.json(r);}
    if(action==='update_restaurant'){const r=await(await fetch(U+'/rest/v1/restaurants?id=eq.'+data.id,{method:'PATCH',headers:h,body:JSON.stringify(data)})).json();return res.json(r);}
    if(action==='save_order'){const r=await(await fetch(U+'/rest/v1/orders',{method:'POST',headers:h,body:JSON.stringify(data)})).json();return res.json(r);}
    if(action==='get_orders'){const r=await(await fetch(U+'/rest/v1/orders?restaurant_id=eq.'+data.restaurant_id+'&order=created_at.desc&limit=50',{headers:g})).json();return res.json(r);}
    res.json({error:'unknown action'});
  } catch(e){res.status(500).json({error:e.message});}
};
