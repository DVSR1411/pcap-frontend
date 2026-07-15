import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import UploadPage from './page.jsx';

export default async function UploadServerPage() {
  const session = await auth();
  if (!session) redirect('/');
  return <UploadPage accessToken={session.accessToken} />;
}
