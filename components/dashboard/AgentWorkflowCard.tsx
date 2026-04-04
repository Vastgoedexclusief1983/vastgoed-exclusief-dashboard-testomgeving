'use client';

import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  Camera,
  FileSearch,
  Globe,
  PlusCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type WorkflowStep = {
  id: number;
  title: string;
  description: string;
  href: string;
  done: boolean;
  metric?: string;
  cta: string;
  icon: any;
};

interface AgentWorkflowCardProps {
  totalProperties?: number;
  totalValuations?: number;
  totalMediaItems?: number;
  totalPublishedProperties?: number;
  totalPromotions?: number;
  className?: string;
}

function StepCard({
  step,
  isLast,
}: {
  step: WorkflowStep;
  isLast: boolean;
}) {
  const Icon = step.icon;

  return (
    <div className="relative">
      {!isLast && (
        <div className="absolute left-[28px] top-[64px] hidden h-[calc(100%-28px)] w-px bg-slate-200 lg:block" />
      )}

      <div
        className={cn(
          'group relative overflow-hidden rounded-3xl border bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md',
          step.done
            ? 'border-emerald-200'
            : 'border-slate-200 hover:border-[#102c54]/20'
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border',
              step.done
                ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                : 'border-slate-200 bg-slate-50 text-[#102c54]'
            )}
          >
            <Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex h-7 items-center rounded-full bg-[#102c54] px-3 text-xs font-semibold text-white">
                Stap {step.id}
              </span>

              <span
                className={cn(
                  'inline-flex h-7 items-center rounded-full px-3 text-xs font-semibold',
                  step.done
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                )}
              >
                {step.done ? 'Voltooid' : 'Open'}
              </span>

              {step.metric ? (
                <span className="inline-flex h-7 items-center rounded-full bg-slate-100 px-3 text-xs font-medium text-slate-600">
                  {step.metric}
                </span>
              ) : null}
            </div>

            <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              {step.description}
            </p>

            <div className="mt-4">
              <Link
                href={step.href}
                className={cn(
                  'inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition',
                  step.done
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    : 'bg-[#102c54] text-white hover:bg-[#0c2343]'
                )}
              >
                {step.cta}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AgentWorkflowCard({
  totalProperties = 0,
  totalValuations = 0,
  totalMediaItems = 0,
  totalPublishedProperties = 0,
  totalPromotions = 0,
  className,
}: AgentWorkflowCardProps) {
  const steps: WorkflowStep[] = [
    {
      id: 1,
      title: 'Woning aanmelden',
      description:
        'Voeg een nieuwe woning toe en vul de basisgegevens in voor opname in uw portefeuille.',
      href: '/properties/new',
      done: totalProperties > 0,
      metric:
        totalProperties > 0
          ? `${totalProperties} woning${totalProperties === 1 ? '' : 'en'}`
          : 'Nog geen woningen',
      cta: totalProperties > 0 ? 'Woning toevoegen' : 'Start aanmelden',
      icon: PlusCircle,
    },
    {
      id: 2,
      title: 'Waarde & positionering',
      description:
        'Bepaal een basisprijs, verzamel inzichten en werk aan een sterke positionering van de woning.',
      href: '/ai-vraag',
      done: totalValuations > 0,
      metric:
        totalValuations > 0
          ? `${totalValuations} waardering${totalValuations === 1 ? '' : 'en'}`
          : 'Nog niet gestart',
      cta: totalValuations > 0 ? 'Bekijk waardering' : 'Start waardering',
      icon: FileSearch,
    },
    {
      id: 3,
      title: 'Presentatie & media',
      description:
        'Verbeter de presentatie met restyle-foto’s, visuele optimalisatie en aanvullende content.',
      href: '/ai-multimedia',
      done: totalMediaItems > 0,
      metric:
        totalMediaItems > 0
          ? `${totalMediaItems} media item${totalMediaItems === 1 ? '' : 's'}`
          : 'Nog geen media',
      cta: totalMediaItems > 0 ? 'Media beheren' : 'Media toevoegen',
      icon: Camera,
    },
    {
      id: 4,
      title: 'Website & publicatie',
      description:
        'Controleer of de woning klaar staat voor publicatie en beheer de zichtbaarheid op het platform.',
      href: '/website',
      done: totalPublishedProperties > 0,
      metric:
        totalPublishedProperties > 0
          ? `${totalPublishedProperties} gepubliceerd`
          : 'Nog niet gepubliceerd',
      cta:
        totalPublishedProperties > 0
          ? 'Bekijk publicatie'
          : 'Naar website beheer',
      icon: Globe,
    },
    {
      id: 5,
      title: 'Promotie activeren',
      description:
        'Schaal op met presentatie- en promotiepakketten voor extra bereik en premium zichtbaarheid.',
      href: '/presentatie-promotie',
      done: totalPromotions > 0,
      metric:
        totalPromotions > 0
          ? `${totalPromotions} promotie${totalPromotions === 1 ? '' : 's'}`
          : 'Nog niet geactiveerd',
      cta:
        totalPromotions > 0 ? 'Bekijk promotie' : 'Promotie instellen',
      icon: BadgeCheck,
    },
  ];

  const completedSteps = steps.filter((step) => step.done).length;
  const progress = Math.round((completedSteps / steps.length) * 100);

  return (
    <section
      className={cn(
        'overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      <div className="border-b border-slate-200 bg-gradient-to-r from-[#102c54] via-[#153b70] to-[#1a4d8f] px-6 py-6 text-white md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-white/90">
              Workflow makelaar
            </div>
            <h2 className="text-2xl font-semibold md:text-3xl">
              Begeleid elke woning stap voor stap naar publicatie
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/80 md:text-base">
              Deze workflow geeft direct inzicht in welke stappen al zijn afgerond
              en waar nog actie nodig is binnen uw dashboard.
            </p>
          </div>

          <div className="min-w-[260px] rounded-3xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/80">Voortgang</span>
              <span className="font-semibold text-white">
                {completedSteps}/{steps.length} stappen
              </span>
            </div>

            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-white transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-white/80">
              {progress === 100
                ? 'Uw workflow is volledig afgerond.'
                : 'Werk de open stappen af voor een complete woningpresentatie.'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-6 py-6 md:px-8 md:py-8">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {steps.map((step, index) => (
            <StepCard
              key={step.id}
              step={step}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
