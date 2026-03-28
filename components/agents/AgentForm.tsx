'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { createAgentSchema, CreateAgentInput } from '@/lib/validations/agent';
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
import { IAgent, SerializedAgent } from '@/types/agent';
import { useTranslations } from 'next-intl';

interface AgentFormProps {
  agent?: SerializedAgent;
  mode: 'create' | 'edit';
}

export function AgentForm({ agent, mode }: AgentFormProps) {
  const router = useRouter();
  const t = useTranslations('agentForm');
  const tCommon = useTranslations('common');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  const form = useForm<CreateAgentInput>({
    resolver: zodResolver(createAgentSchema),
    defaultValues: {
      email: agent?.email || '',
      firstName: agent?.firstName || '',
      lastName: agent?.lastName || '',
      companyName: agent?.companyName || '',
      agentCode: agent?.agentCode || '',
      password: '',
    },
  });

  async function onSubmit(data: CreateAgentInput) {
    setIsLoading(true);

    try {
      const url = mode === 'create' ? '/api/agents' : `/api/agents/${agent?._id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const payload = data.password
        ? data
        : { ...data, password: undefined };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || tCommon('error'));
        setIsLoading(false);
        return;
      }

      if (mode === 'create' && result.data.generatedPassword) {
        setGeneratedPassword(result.data.generatedPassword);
        toast.success(t('agentCreated'));
      } else {
        toast.success(mode === 'create' ? t('agentCreated') : t('agentUpdated'));
        router.push('/admin/agents');
        router.refresh();
      }

      setIsLoading(false);
    } catch (error) {
      toast.error(tCommon('error'));
      setIsLoading(false);
    }
  }

  if (generatedPassword) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h3 className="font-semibold text-green-900">{t('agentCreated')}</h3>
          <p className="mt-2 text-sm text-green-700">
            {t('savePassword')}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <code className="rounded bg-white px-3 py-2 text-sm font-mono">
              {generatedPassword}
            </code>
            <Button
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(generatedPassword);
                toast.success(t('passwordCopied'));
              }}
            >
              {t('copy')}
            </Button>
          </div>
        </div>
        <Button onClick={() => router.push('/admin/agents')}>
          {t('goToAgentsList')}
        </Button>
      </div>
    );
  }

  return (
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
                  <Input placeholder={t('firstNamePlaceholder')} disabled={isLoading} {...field} />
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
                  <Input placeholder={t('lastNamePlaceholder')} disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('email')}</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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

        <FormField
          control={form.control}
          name="agentCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('agentCode')}</FormLabel>
              <FormControl>
                <Input placeholder="AG001" disabled={isLoading} {...field} />
              </FormControl>
              <FormDescription>
                {t('agentCodeDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                {t('password')} {mode === 'create' && `(${t('optional')})`}
              </FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder={
                    mode === 'create'
                      ? t('passwordPlaceholderCreate')
                      : t('passwordPlaceholderEdit')
                  }
                  disabled={isLoading}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {mode === 'create'
                  ? t('passwordDescriptionCreate')
                  : t('passwordDescriptionEdit')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? mode === 'create'
                ? t('creating')
                : t('updating')
              : mode === 'create'
              ? t('createAgent')
              : t('updateAgent')}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/admin/agents')}
            disabled={isLoading}
          >
            {tCommon('cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
