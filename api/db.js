const handler = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  if (req.method === 'OPTIONS') return res.status(200).end();
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  return res.status(200).json({ ok: true, action: body.action });
};
module.exports = handler;
