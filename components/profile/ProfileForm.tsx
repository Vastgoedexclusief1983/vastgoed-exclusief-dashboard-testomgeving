'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Mail, Key } from 'lucide-react';

const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  companyName: z.string().optional(),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required to set a new password',
  path: ['currentPassword'],
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileInput = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: {
    _id: string;
    email: string;
    firstName: string;
    lastName: string;
    companyName?: string;
    agentCode: string;
    createdAt: string;
    lastLogin: string;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const t = useTranslations('profile');
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user.firstName,
      lastName: user.lastName,
      companyName: user.companyName || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(data: ProfileInput) {
    setIsLoading(true);

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || t('updateError'));
        setIsLoading(false);
        return;
      }

      toast.success(t('updateSuccess'));
      router.refresh();
      form.reset({
        firstName: data.firstName,
        lastName: data.lastName,
        companyName: data.companyName || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error) {
      toast.error(t('updateError'));
    } finally {
      setIsLoading(false);
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8">
      {/* Read-only Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-3">
          <Mail className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">{t('email')}</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Key className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">{t('agentCode')}</p>
            <Badge variant="secondary">{user.agentCode}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">{t('memberSince')}</p>
            <p className="font-medium">{formatDate(user.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-gray-400" />
          <div>
            <p className="text-sm text-gray-500">{t('lastLogin')}</p>
            <p className="font-medium">{formatDate(user.lastLogin)}</p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('firstName')}</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('lastName')}</FormLabel>
                  <FormControl>
                    <Input disabled={isLoading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="companyName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('companyName')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('companyNamePlaceholder')} disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium mb-4">{t('changePassword')}</h3>
            <p className="text-sm text-gray-500 mb-4">{t('changePasswordDescription')}</p>

            <div className="grid gap-4 md:grid-cols-3">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('currentPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('newPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('confirmPassword')}</FormLabel>
                    <FormControl>
                      <Input type="password" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? t('saving') : t('saveChanges')}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
