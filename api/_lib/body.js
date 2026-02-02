export async function readJson(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      const err = new Error('Invalid JSON');
      err.statusCode = 400;
      throw err;
    }
  }

  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const data = Buffer.concat(chunks).toString('utf-8');
  if (!data) return {};
  try {
    return JSON.parse(data);
  } catch (error) {
    const err = new Error('Invalid JSON');
    err.statusCode = 400;
    throw err;
  }
}
