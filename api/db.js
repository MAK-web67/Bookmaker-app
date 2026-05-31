if(action==='register'){
  const email=data.email;
  const password=data.password;
  const rd={name:data.name,type:data.type,city:data.city,description:data.description,emoji:data.emoji,color:data.color,lang:data.lang,plan:data.plan,slug:data.slug,menu:data.menu||[]};
  const c=await(await fetch(U+'/rest/v1/accounts?email=eq.'+encodeURIComponent(email)+'&limit=1',{headers:g})).json();
  if(c&&c.length>0)return res.json({error:'duplicate'});
  const r=await(await fetch(U+'/rest/v1/restaurants',{method:'POST',headers:h,body:JSON.stringify(rd)})).json();
  const rid=Array.isArray(r)?r[0].id:r.id;
  const a=await(await fetch(U+'/rest/v1/accounts',{method:'POST',headers:h,body:JSON.stringify({email,password,restaurant_id:rid})})).json();
  return res.json(Array.isArray(a)?a[0]:a);
}
