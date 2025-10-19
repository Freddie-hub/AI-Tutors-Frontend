import { adminAuth } from './firebaseAdmin';

export async function requireUser(req: Request) {
  const authHeader = req.headers.get('authorization') || req.headers.get('Authorization');
  if (!authHeader || !authHeader.toLowerCase().startsWith('bearer ')) {
    throw new Response(JSON.stringify({ message: 'Unauthorized' }), { status: 401 });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded;
  } catch {
    throw new Response(JSON.stringify({ message: 'Invalid token' }), { status: 401 });
  }
}

export async function verifyIdToken(token: string) {
  return adminAuth.verifyIdToken(token);
}
