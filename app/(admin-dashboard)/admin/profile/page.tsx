import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { AdminProfileForm } from '@/components/profile/AdminProfileForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';
import dbConnect from '@/lib/db/mongodb';
import UserModel from '@/lib/db/models/User';

export const metadata = {
  title: 'Admin Profile',
  description: 'Manage your admin profile',
};

export default async function AdminProfilePage() {
  const session = await getSession();
  const t = await getTranslations('profile');

  if (!session) {
    redirect('/login');
  }

  if (session.user.role !== 'admin') {
    redirect('/dashboard');
  }

  await dbConnect();

  const user = await UserModel.findById(session.user.id).select('-password').lean();

  if (!user) {
    redirect('/login');
  }

  const serializedUser = {
    _id: user._id.toString(),
    email: user.email,
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    role: user.role,
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
            {t('adminTitle')}
          </h1>
        </div>
        <p className="text-gray-600 ml-12">
          {t('adminSubtitle')}
        </p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('personalInfo')}</CardTitle>
          <CardDescription>{t('personalInfoDescription')}</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminProfileForm user={serializedUser} />
        </CardContent>
      </Card>
    </div>
  );
}
