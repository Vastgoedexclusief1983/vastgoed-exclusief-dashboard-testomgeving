import { redirect } from 'next/navigation';
import Image from 'next/image';
import { getSession } from '@/lib/auth/session';
import { LoginForm } from '@/components/auth/LoginForm';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { getTranslations } from 'next-intl/server';

export default async function LoginPage() {
  const session = await getSession();
  const t = await getTranslations('login');

  if (session) {
    redirect('/dashboard');
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#102c54] px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-4 flex flex-col items-center">
          <div className="w-64 h-28 relative">
            <Image
              src="/logo.png"
              alt="Vastgoed Exclusief"
              fill
              className="object-contain"
              priority
            />
          </div>
          <CardDescription>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
