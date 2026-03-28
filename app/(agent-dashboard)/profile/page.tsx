import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import dbConnect from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';

export const metadata = {
  title: 'Mijn Profiel',
  description: 'Beheer uw profielinformatie',
};

export default async function ProfilePage() {
  const session = await getSession();
  const t = await getTranslations('profile');

  if (!session) {
    redirect('/login');
  }

  await dbConnect();

  const user = await UserModel.findById(session.user.id).select('-password').lean();

  if (!user) {
    redirect('/login');
  }

  const serializedUser = {
    _id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    companyName: user.companyName || '',
    agentCode: user.agentCode || '',
    createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : '',
    lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString() : '',
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-[#102c54]/10 rounded-lg">
            <User className="h-6 w-6 text-[#102c54]" />
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold text-[#102c54]">
            {t('title')}
          </h1>
        </div>
        <p className="text-gray-600 ml-12">
          {t('subtitle')}
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('personalInfo')}</CardTitle>
          <CardDescription>{t('personalInfoDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm user={serializedUser} />
        </CardContent>
      </Card>
    </div>
  );
}
