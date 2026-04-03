'use client';

import { useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BadgeEuro,
  BedDouble,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  FileImage,
  Home,
  ImagePlus,
  Landmark,
  Mail,
  MapPin,
  Phone,
  PlusCircle,
  Send,
  Sparkles,
  Tag,
  UploadCloud,
  XCircle,
  Pencil,
} from 'lucide-react';
import type {
  DashboardProperty,
  PropertyStatus,
} from '@/lib/data/properties';

export type ActionType =
  | 'aanmelden'
  | 'wijzigen'
  | 'afmelden'
  | 'onder-bod'
  | 'prijswijziging';

export type AanmeldenForm = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  askingPrice: string;
  livingArea: string;
  plotArea: string;
  bedrooms: string;
  energyLabel: string;
  luxuryFeatures: string;
  description: string;
  notes: string;
};

export type MutatieForm = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  currentPrice: string;
  newPrice: string;
  soldPrice: string;
  statusDate: string;
  notes: string;
};

type VisualPropertyStatus =
  | 'actief'
  | 'onder-bod'
  | 'verkocht'
  | 'prijswijziging';

type FilterKey =
  | 'alle'
  | 'actief'
  | 'onder-bod'
  | 'verkocht'
  | 'prijswijziging';

type PropertyVisualState = {
  visualStatus: VisualPropertyStatus;
  lastActionLabel: string;
};

const initialAanmelden: AanmeldenForm = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  askingPrice: '',
  livingArea: '',
  plotArea: '',
  bedrooms: '',
  energyLabel: '',
  luxuryFeatures: '',
  description: '',
  notes: '',
};

const initialMutatie: MutatieForm = {
  companyName: '',
  contactName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  currentPrice: '',
  newPrice: '',
  soldPrice: '',
  statusDate: '',
  notes: '',
};

const actionConfig: {
  key: ActionType;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
}[] = [
  {
    key: 'aanmelden',
    title: 'Woning aanmelden',
    subtitle: 'Nieuwe woning aanmelden',
    description:
      'Voeg direct alle hoofdgegevens, luxe kenmerken en maximaal 10 woningfoto’s toe.',
    badge: 'Nieuw object',
  },
  {
    key: 'wijzigen',
    title: 'Woning wijzigen',
    subtitle: 'Gegevens of omschrijving aanpassen',
    description:
      'Gebruik deze actie om bestaande woninginformatie, teksten of presentatie aan te passen.',
    badge: 'Wijziging',
  },
  {
    key: 'afmelden',
    title: 'Woning verkocht',
    subtitle: 'Object als verkocht doorgeven',
    description:
      'Geef netjes door zodra een woning verkocht is, inclusief de prijs waarvoor deze is verkocht.',
    badge: 'Verkocht',
  },
  {
    key: 'onder-bod',
    title: 'Onder bod melden',
    subtitle: 'Status tijdelijk aanpassen',
    description:
      'Geef snel door dat een object onder bod staat zodat de website direct actueel blijft.',
    badge: 'Status',
  },
  {
    key: 'prijswijziging',
    title: 'Prijswijziging',
    subtitle: 'Vraagprijs actualiseren',
    description:
      'Geef eenvoudig een nieuwe vraagprijs door voor verwerking op het platform.',
    badge: 'Prijs update',
  },
];

type Props = {
  initialProperties: DashboardProperty[];
  agentName: string;
  agentEmail: string;
};

function mapInitialStatus(status: PropertyStatus): VisualPropertyStatus {
  if (status === 'onder-bod') return 'onder-bod';
  if (status === 'verkocht') return 'verkocht';
  return 'actief';
}

function mapInitialLastAction(status: PropertyStatus): string {
  if (status === 'onder-bod') return 'Onder bod';
  if (status === 'verkocht') return 'Verkocht gemeld';
  if (status === 'gepubliceerd') return 'Actief op website';
  return 'Actief';
}

function buildInitialVisualState(
  properties: DashboardProperty[]
): Record<string, PropertyVisualState> {
  return properties.reduce<Record<string, PropertyVisualState>>((acc, property) => {
    acc[property.id] = {
      visualStatus: mapInitialStatus(property.status),
      lastActionLabel: mapInitialLastAction(property.status),
    };
    return acc;
  }, {});
}

function getVisualStateAfterAction(
  action: ActionType
): Pick<PropertyVisualState, 'visualStatus' | 'lastActionLabel'> {
  switch (action) {
    case 'onder-bod':
      return {
        visualStatus: 'onder-bod',
        lastActionLabel: 'Onder bod doorgegeven',
      };
    case 'afmelden':
      return {
        visualStatus: 'verkocht',
        lastActionLabel: 'Verkocht doorgegeven',
      };
    case 'prijswijziging':
      return {
        visualStatus: 'prijswijziging',
        lastActionLabel: 'Prijswijziging doorgegeven',
      };
    case 'wijzigen':
      return {
        visualStatus: 'actief',
        lastActionLabel: 'Wijziging doorgegeven',
      };
    default:
      return {
        visualStatus: 'actief',
        lastActionLabel: 'Actief',
      };
  }
}

export default function WebsitePageClient({
  initialProperties,
  agentName,
  agentEmail,
}: Props) {
  const router = useRouter();

  const [activeAction, setActiveAction] = useState<ActionType>('aanmelden');
  const [propertyStates, setPropertyStates] = useState<Record<string, PropertyVisualState>>(
    () => buildInitialVisualState(initialProperties)
  );
  const [activeFilter, setActiveFilter] = useState<FilterKey>('alle');
  const [aanmeldenForm, setAanmeldenForm] = useState<AanmeldenForm>({
    ...initialAanmelden,
    contactName: agentName || '',
    email: agentEmail || '',
  });
  const [mutatieForm, setMutatieForm] = useState<MutatieForm>({
    ...initialMutatie,
    companyName: 'Vastgoed Exclusief Makelaar',
    contactName: agentName || '',
    email: agentEmail || '',
  });
  const [files, setFiles] = useState<File[]>([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    initialProperties[0]?.id ?? null
  );

  const activeConfig = useMemo(
    () => actionConfig.find((item) => item.key === activeAction),
    [activeAction]
  );

  const selectedProperty = useMemo(
    () =>
      initialProperties.find((item) => item.id === selectedPropertyId) ?? null,
    [initialProperties, selectedPropertyId]
  );

  const filteredProperties = useMemo(() => {
    if (activeFilter === 'alle') return initialProperties;

    return initialProperties.filter((property) => {
      const currentState = propertyStates[property.id];
      return currentState?.visualStatus === activeFilter;
    });
  }, [activeFilter, initialProperties, propertyStates]);

  const filterCounts = useMemo(() => {
    const counts = {
      alle: initialProperties.length,
      actief: 0,
      'onder-bod': 0,
      verkocht: 0,
      prijswijziging: 0,
    };

    initialProperties.forEach((property) => {
      const state = propertyStates[property.id];
      if (!state) return;
      counts[state.visualStatus] += 1;
    });

    return counts;
  }, [initialProperties, propertyStates]);

  function updateAanmelden<K extends keyof AanmeldenForm>(
    key: K,
    value: AanmeldenForm[K]
  ) {
    setAanmeldenForm((prev) => ({ ...prev, [key]: value }));
  }

  function updateMutatie<K extends keyof MutatieForm>(
    key: K,
    value: MutatieForm[K]
  ) {
    setMutatieForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    const imagesOnly = selected.filter((file) => file.type.startsWith('image/'));
    const limited = imagesOnly.slice(0, 10);

    setFiles(limited);

    if (selected.length > 10) {
      setErrorMessage('Je kunt maximaal 10 foto’s uploaden.');
    } else {
      setErrorMessage('');
    }
  }

  function resetMessages() {
    setSuccessMessage('');
    setErrorMessage('');
  }

  function validateCurrentForm() {
    if (activeAction === 'aanmelden') {
      if (
        !aanmeldenForm.companyName ||
        !aanmeldenForm.contactName ||
        !aanmeldenForm.email ||
        !aanmeldenForm.address ||
        !aanmeldenForm.city ||
        !aanmeldenForm.askingPrice
      ) {
        setErrorMessage('Vul alle verplichte velden van de woningaanmelding in.');
        return false;
      }

      if (files.length > 10) {
        setErrorMessage('Je kunt maximaal 10 foto’s uploaden.');
        return false;
      }

      return true;
    }

    if (!selectedPropertyId) {
      setErrorMessage('Selecteer eerst een woning.');
      return false;
    }

    if (
      !mutatieForm.companyName ||
      !mutatieForm.contactName ||
      !mutatieForm.email ||
      !mutatieForm.address ||
      !mutatieForm.city
    ) {
      setErrorMessage('Vul alle verplichte velden in voor deze mutatie.');
      return false;
    }

    if (activeAction === 'prijswijziging' && !mutatieForm.newPrice) {
      setErrorMessage('Vul de nieuwe prijs in.');
      return false;
    }

    if (activeAction === 'afmelden' && !mutatieForm.soldPrice) {
      setErrorMessage('Vul de prijs in waarvoor de woning is verkocht.');
      return false;
    }

    return true;
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    resetMessages();

    if (!validateCurrentForm()) return;

    try {
      setIsSubmitting(true);

      const chosenProperty =
        initialProperties.find((item) => item.id === selectedPropertyId) ?? null;

      const payload =
        activeAction === 'aanmelden'
          ? {
              address: aanmeldenForm.address,
              city: aanmeldenForm.city,
              agentName,
              changes: {
                type: 'woning-aanmelding',
                companyName: aanmeldenForm.companyName,
                contactName: aanmeldenForm.contactName,
                email: aanmeldenForm.email,
                phone: aanmeldenForm.phone,
                askingPrice: aanmeldenForm.askingPrice,
                livingArea: aanmeldenForm.livingArea,
                plotArea: aanmeldenForm.plotArea,
                bedrooms: aanmeldenForm.bedrooms,
                energyLabel: aanmeldenForm.energyLabel,
                luxuryFeatures: aanmeldenForm.luxuryFeatures,
                description: aanmeldenForm.description,
                notes: aanmeldenForm.notes,
                files: files.map((file) => file.name),
              },
            }
          : {
              address: mutatieForm.address || chosenProperty?.address || '',
              city: mutatieForm.city || chosenProperty?.city || '',
              agentName,
              changes: {
                type: activeAction,
                companyName: mutatieForm.companyName,
                contactName: mutatieForm.contactName,
                email: mutatieForm.email,
                phone: mutatieForm.phone,
                currentPrice: mutatieForm.currentPrice,
                newPrice: mutatieForm.newPrice,
                soldPrice: mutatieForm.soldPrice,
                statusDate: mutatieForm.statusDate,
                notes: mutatieForm.notes,
                propertyId: chosenProperty?.id || null,
                propertyTitle: chosenProperty?.title || null,
                propertyAddress: chosenProperty?.address || null,
                propertyCity: chosenProperty?.city || null,
              },
            };

      const response = await fetch('/api/send-property-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        setErrorMessage(
          result?.error || 'Verzenden van de aanvraag is mislukt.'
        );
        return;
      }

      const label =
        activeAction === 'aanmelden'
          ? 'woningaanmelding'
          : activeAction === 'wijzigen'
          ? 'wijziging'
          : activeAction === 'afmelden'
          ? 'woning verkocht melding'
          : activeAction === 'onder-bod'
          ? 'onder bod melding'
          : 'prijswijziging';

      setSuccessMessage(
        `De ${label} is succesvol doorgestuurd naar info@vastgoedexclusief.nl.`
      );

      if (activeAction !== 'aanmelden' && chosenProperty?.id) {
        const nextState = getVisualStateAfterAction(activeAction);

        setPropertyStates((prev) => ({
          ...prev,
          [chosenProperty.id]: nextState,
        }));
      }

      if (activeAction === 'aanmelden') {
        setAanmeldenForm({
          ...initialAanmelden,
          contactName: agentName || '',
          email: agentEmail || '',
        });
        setFiles([]);
      } else {
        setMutatieForm((prev) => ({
          ...prev,
          soldPrice: '',
          notes: '',
          statusDate: '',
        }));
      }
    } catch {
      setErrorMessage('Verzenden van de aanvraag is mislukt.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function scrollToForm() {
    const element = document.getElementById('beheer-form');
    element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function openPropertyAction(property: DashboardProperty, action: ActionType) {
    setSelectedPropertyId(property.id);
    setActiveAction(action);
    resetMessages();

    setMutatieForm({
      companyName: 'Vastgoed Exclusief Makelaar',
      contactName: agentName,
      email: agentEmail,
      phone: '',
      address: property.address,
      city: property.city,
      currentPrice: property.price,
      newPrice: action === 'prijswijziging' ? property.price : '',
      soldPrice: '',
      statusDate: '',
      notes:
        action === 'wijzigen'
          ? `Wijziging voor woning: ${property.address}, ${property.city}`
          : action === 'afmelden'
          ? `Woning verkocht voor object: ${property.address}, ${property.city}`
          : action === 'onder-bod'
          ? `Onder bod melding voor woning: ${property.address}, ${property.city}`
          : action === 'prijswijziging'
          ? `Prijswijziging voor woning: ${property.address}, ${property.city}`
          : '',
    });

    scrollToForm();
  }

  const filterOptions: { key: FilterKey; label: string }[] = [
    { key: 'alle', label: 'Alle' },
    { key: 'actief', label: 'Actief' },
    { key: 'onder-bod', label: 'Onder bod' },
    { key: 'verkocht', label: 'Verkocht' },
    { key: 'prijswijziging', label: 'Prijswijziging' },
  ];

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(29,78,216,0.08),_transparent_28%),linear-gradient(180deg,#f4f7fb_0%,#eef3f9_100%)]">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 lg:px-8">
        <section className="mb-6 overflow-hidden rounded-[30px] border border-white/70 bg-white/45 shadow-[0_20px_60px_rgba(16,44,84,0.08)] backdrop-blur-2xl">
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/60 px-4 py-2 text-xs font-medium text-[#153c75] shadow-sm backdrop-blur-xl">
                  <Sparkles className="h-4 w-4" />
                  Centrale beheeromgeving voor aangesloten makelaars
                </div>

                <h1 className="mt-4 text-3xl font-semibold tracking-tight text-[#102c54] md:text-4xl xl:text-5xl">
                  Website beheer
                </h1>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#5b6b82] md:text-base">
                  Beheer je woningaanmeldingen, wijzigingen en statusupdates vanuit
                  één overzichtelijke premium pagina.
                </p>

                <div className="mt-5 flex flex-wrap gap-3">
                  <GlassStatPill
                    icon={<Home className="h-4 w-4" />}
                    text="Woningen beheren"
                  />
                  <GlassStatPill
                    icon={<Tag className="h-4 w-4" />}
                    text="Snelle statusupdates"
                  />
                  <GlassStatPill
                    icon={<FileImage className="h-4 w-4" />}
                    text="Foto’s en intake"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[360px]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveAction('aanmelden');
                    scrollToForm();
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#102c54] to-[#1b4b8f] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(16,44,84,0.22)] transition hover:scale-[1.02]"
                >
                  <PlusCircle className="h-4 w-4" />
                  Woning aanmelden
                </button>

                <button
                  type="button"
                  onClick={scrollToForm}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/70 bg-white/70 px-5 py-3 text-sm font-semibold text-[#153c75] shadow-sm backdrop-blur transition hover:bg-white"
                >
                  <ArrowRight className="h-4 w-4" />
                  Beheerformulier
                </button>

                <div className="rounded-[24px] border border-white/70 bg-white/55 p-4 shadow-sm backdrop-blur xl:col-span-2">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-[#6b7b93]">
                        Actieve module
                      </p>
                      <h2 className="mt-1 text-xl font-semibold text-[#102c54]">
                        {activeConfig?.title}
                      </h2>
                    </div>

                    <span className="rounded-full border border-[#d7e3f3] bg-[#f8fbff] px-3 py-1 text-xs font-medium text-[#153c75]">
                      {activeConfig?.badge}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#64748b]">
                    {activeConfig?.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {actionConfig.map((item) => {
            const active = item.key === activeAction;

            const icon =
              item.key === 'aanmelden' ? (
                <PlusCircle className="h-5 w-5" />
              ) : item.key === 'wijzigen' ? (
                <Edit3 className="h-5 w-5" />
              ) : item.key === 'afmelden' ? (
                <XCircle className="h-5 w-5" />
              ) : item.key === 'onder-bod' ? (
                <Tag className="h-5 w-5" />
              ) : (
                <BadgeEuro className="h-5 w-5" />
              );

            const topBarClass =
              item.key === 'aanmelden'
                ? 'from-[#143567] via-[#2d6cdf] to-[#60a5fa]'
                : item.key === 'wijzigen'
                ? 'from-[#5634a3] via-[#7c3aed] to-[#a78bfa]'
                : item.key === 'afmelden'
                ? 'from-[#14532d] via-[#16a34a] to-[#4ade80]'
                : item.key === 'onder-bod'
                ? 'from-[#854d0e] via-[#d97706] to-[#fbbf24]'
                : 'from-[#7a1f46] via-[#db2777] to-[#f472b6]';

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveAction(item.key);
                  resetMessages();
                  scrollToForm();
                }}
                className={`group relative overflow-hidden rounded-[28px] border text-left transition-all duration-300 ${
                  active
                    ? 'border-white/80 bg-white/80 shadow-[0_22px_55px_rgba(16,44,84,0.14)] ring-1 ring-white/70 backdrop-blur-xl'
                    : 'border-white/70 bg-white/60 shadow-[0_18px_40px_rgba(16,44,84,0.08)] backdrop-blur-xl hover:-translate-y-1 hover:bg-white/75 hover:shadow-[0_22px_55px_rgba(16,44,84,0.12)]'
                }`}
              >
                <div className={`h-1.5 w-full bg-gradient-to-r ${topBarClass}`} />

                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.35),transparent_35%)] opacity-90" />

                <div className="relative p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-2xl border shadow-sm ${
                        active
                          ? 'border-white/80 bg-white text-[#153c75]'
                          : 'border-white/70 bg-white/70 text-[#153c75]'
                      }`}
                    >
                      {icon}
                    </div>

                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-[11px] font-semibold ${
                        active
                          ? 'bg-[#153c75] text-white'
                          : 'border border-[#dbe4f1] bg-white/80 text-[#153c75]'
                      }`}
                    >
                      {active ? 'Actief' : item.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-lg font-semibold leading-tight text-[#102c54]">
                    {item.title}
                  </h3>

                  <p className="mt-2 min-h-[96px] text-sm leading-6 text-[#64748b]">
                    {item.description}
                  </p>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-[#7a8aa3]">
                      Workflow
                    </span>

                    <span className="inline-flex items-center gap-1 text-sm font-medium text-[#153c75]">
                      Openen
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </section>

        <section className="mt-8 rounded-[30px] border border-[#e5ecf6] bg-white p-5 shadow-[0_25px_70px_rgba(16,44,84,0.08)] md:p-8">
          <div className="flex flex-col gap-4 border-b border-[#edf2f8] pb-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-medium text-[#153c75]">
                  Mijn website woningen
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-[#102c54]">
                  Bestaande woningen met snelle actieknoppen
                </h2>
                <p className="mt-2 text-sm text-[#64748b]">
                  Deze lijst komt nu rechtstreeks uit de database van de ingelogde
                  makelaar. De statusweergave hieronder is visueel bedoeld voor de
                  makelaar en wordt direct bijgewerkt zodra een actie is verstuurd.
                </p>
              </div>

              <div className="rounded-full bg-[#f7faff] px-4 py-2 text-sm font-medium text-[#153c75]">
                {filteredProperties.length} van {initialProperties.length} woningen zichtbaar
              </div>
            </div>

            {initialProperties.length > 0 ? (
              <div className="flex flex-wrap gap-3 pt-2">
                {filterOptions.map((filter) => {
                  const active = activeFilter === filter.key;
                  const count = filterCounts[filter.key];

                  return (
                    <button
                      key={filter.key}
                      type="button"
                      onClick={() => setActiveFilter(filter.key)}
                      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
                        active
                          ? 'border-[#153c75] bg-[#153c75] text-white shadow-sm'
                          : 'border-[#dbe5f2] bg-[#f8fbff] text-[#153c75] hover:border-[#c8d7eb] hover:bg-white'
                      }`}
                    >
                      <span>{filter.label}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          active
                            ? 'bg-white/15 text-white'
                            : 'bg-white text-[#153c75]'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>

          {initialProperties.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-[#d7e1f0] bg-[#fbfdff] p-10 text-center">
              <h3 className="text-xl font-semibold text-[#102c54]">
                Nog geen woningen gevonden
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#64748b]">
                Er zijn nog geen woningen gekoppeld aan dit account. Voeg eerst
                een woning toe via het onderdeel <strong>Woningen</strong>.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => router.push('/properties')}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#102c54] to-[#1b4b8f] px-5 py-3 text-sm font-medium text-white"
                >
                  <ArrowRight className="h-4 w-4" />
                  Naar woningen
                </button>
              </div>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div className="mt-6 rounded-[28px] border border-dashed border-[#d7e1f0] bg-[#fbfdff] p-10 text-center">
              <h3 className="text-xl font-semibold text-[#102c54]">
                Geen woningen binnen dit filter
              </h3>
              <p className="mt-3 text-sm leading-6 text-[#64748b]">
                Kies een ander filter om meer woningen te tonen.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 xl:grid-cols-3">
              {filteredProperties.map((property) => {
                const isSelected = selectedPropertyId === property.id;
                const visualState = propertyStates[property.id] ?? {
                  visualStatus: 'actief' as VisualPropertyStatus,
                  lastActionLabel: 'Actief',
                };
                const isSold = visualState.visualStatus === 'verkocht';

                return (
                  <div
                    key={property.id}
                    className={`overflow-hidden rounded-[28px] border bg-white shadow-[0_18px_50px_rgba(16,44,84,0.08)] transition ${
                      isSelected
                        ? 'border-[#153c75] ring-4 ring-[#153c75]/10'
                        : 'border-[#e7edf6]'
                    } ${isSold ? 'opacity-[0.96]' : ''}`}
                  >
                    <div className="relative h-56 overflow-hidden bg-slate-100">
                      <img
                        src={property.image}
                        alt={property.title}
                        className={`h-full w-full object-cover transition ${
                          isSold ? 'scale-[1.01] saturate-75' : ''
                        }`}
                      />

                      {isSold ? (
                        <div className="absolute inset-0 bg-[#102c54]/20" />
                      ) : null}

                      <div className="absolute left-4 top-4">
                        <VisualStatusBadge status={visualState.visualStatus} />
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-[#102c54]">
                            {property.title}
                          </h3>
                          <p className="mt-1 flex items-center gap-1 text-sm text-[#64748b]">
                            <MapPin className="h-4 w-4" />
                            {property.address}, {property.city}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => setSelectedPropertyId(property.id)}
                          className="rounded-full border border-[#dce6f3] px-3 py-1 text-xs font-medium text-[#153c75] transition hover:bg-[#f7faff]"
                        >
                          Selecteer
                        </button>
                      </div>

                      <div className="mt-3 rounded-2xl bg-[#f8fbff] px-3 py-2 text-sm text-[#4f627d]">
                        <span className="font-medium text-[#153c75]">
                          Laatste actie:
                        </span>{' '}
                        {visualState.lastActionLabel}
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <MiniInfo
                          icon={<BadgeEuro className="h-4 w-4" />}
                          label="Vraagprijs"
                          value={property.price}
                        />
                        <MiniInfo
                          icon={<Home className="h-4 w-4" />}
                          label="Woonopp."
                          value={
                            property.livingArea !== '—'
                              ? `${property.livingArea} m²`
                              : '—'
                          }
                        />
                        <MiniInfo
                          icon={<Landmark className="h-4 w-4" />}
                          label="Perceel"
                          value={
                            property.plotArea !== '—'
                              ? `${property.plotArea} m²`
                              : '—'
                          }
                        />
                        <MiniInfo
                          icon={<BedDouble className="h-4 w-4" />}
                          label="Slaapkamers"
                          value={property.bedrooms}
                        />
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {property.luxuryTags.length > 0 ? (
                          property.luxuryTags.map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-medium text-[#153c75]"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="rounded-full bg-[#f8fafc] px-3 py-1 text-xs text-[#64748b]">
                            Geen kenmerken toegevoegd
                          </span>
                        )}
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-xs text-[#6b7b93]">
                        <CalendarDays className="h-4 w-4" />
                        Toegevoegd op {property.createdAt}
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <ActionButton
                          icon={<BadgeEuro className="h-4 w-4" />}
                          label="Prijs wijzigen"
                          onClick={() =>
                            openPropertyAction(property, 'prijswijziging')
                          }
                        />
                        <ActionButton
                          icon={<Tag className="h-4 w-4" />}
                          label="Onder bod"
                          onClick={() => openPropertyAction(property, 'onder-bod')}
                        />
                        <ActionButton
                          icon={<Check className="h-4 w-4" />}
                          label="Verkocht"
                          onClick={() => openPropertyAction(property, 'afmelden')}
                        />
                        <ActionButton
                          icon={<Pencil className="h-4 w-4" />}
                          label="Bewerken"
                          onClick={() => openPropertyAction(property, 'wijzigen')}
                        />
                      </div>

                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => router.push(`/properties/${property.id}`)}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-[#d9e3f1] bg-white px-4 py-2 text-sm font-medium text-[#153c75] transition hover:bg-[#f8fbff]"
                        >
                          <Eye className="h-4 w-4" />
                          Bekijken
                        </button>

                        <button
                          type="button"
                          onClick={scrollToForm}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#102c54] to-[#1b4b8f] px-4 py-2 text-sm font-medium text-white transition hover:opacity-95"
                        >
                          <ArrowRight className="h-4 w-4" />
                          Actie
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8">
          <div
            id="beheer-form"
            className="rounded-[30px] border border-[#e5ecf6] bg-white p-5 shadow-[0_25px_70px_rgba(16,44,84,0.08)] md:p-8"
          >
            <div className="flex flex-col gap-4 border-b border-[#edf2f8] pb-6 md:flex-row md:items-end md:justify-between">
              <div>
                <div className="inline-flex rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-medium text-[#153c75]">
                  Centrale beheeractie
                </div>
                <h2 className="mt-3 text-2xl font-semibold text-[#102c54]">
                  {activeConfig?.title}
                </h2>
                <p className="mt-2 text-sm text-[#64748b]">
                  {activeConfig?.subtitle}
                </p>

                {selectedProperty && activeAction !== 'aanmelden' ? (
                  <div className="mt-3 inline-flex rounded-full bg-[#f7faff] px-3 py-1 text-xs font-medium text-[#153c75]">
                    Geselecteerde woning: {selectedProperty.address},{' '}
                    {selectedProperty.city}
                  </div>
                ) : null}
              </div>

              {(activeAction === 'aanmelden' ||
                activeAction === 'wijzigen' ||
                activeAction === 'afmelden') && (
                <button
                  type="button"
                  onClick={() =>
                    router.push(
                      activeAction === 'aanmelden'
                        ? '/dashboard/woning-aanmelden'
                        : activeAction === 'wijzigen'
                        ? '/dashboard/woning-wijziging'
                        : '/dashboard/woning-afmelden'
                    )
                  }
                  className="inline-flex items-center gap-2 rounded-full border border-[#d9e3f1] bg-white px-4 py-2 text-sm font-medium text-[#153c75] transition hover:bg-[#f8fbff]"
                >
                  Bestaande pagina openen
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
            </div>

            {successMessage ? (
              <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-800">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="text-sm leading-6">{successMessage}</p>
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="mt-6 space-y-8">
              {activeAction === 'aanmelden' ? (
                <>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <LuxuryInput
                      label="Bedrijfsnaam *"
                      value={aanmeldenForm.companyName}
                      onChange={(v) => updateAanmelden('companyName', v)}
                    />
                    <LuxuryInput
                      label="Contactpersoon *"
                      value={aanmeldenForm.contactName}
                      onChange={(v) => updateAanmelden('contactName', v)}
                    />
                    <LuxuryInput
                      label="E-mailadres *"
                      type="email"
                      value={aanmeldenForm.email}
                      onChange={(v) => updateAanmelden('email', v)}
                    />
                    <LuxuryInput
                      label="Telefoonnummer"
                      value={aanmeldenForm.phone}
                      onChange={(v) => updateAanmelden('phone', v)}
                    />
                    <LuxuryInput
                      label="Straat + huisnummer *"
                      value={aanmeldenForm.address}
                      onChange={(v) => updateAanmelden('address', v)}
                    />
                    <LuxuryInput
                      label="Plaats *"
                      value={aanmeldenForm.city}
                      onChange={(v) => updateAanmelden('city', v)}
                    />
                    <LuxuryInput
                      label="Vraagprijs *"
                      value={aanmeldenForm.askingPrice}
                      onChange={(v) => updateAanmelden('askingPrice', v)}
                    />
                    <LuxuryInput
                      label="Woonoppervlakte m²"
                      value={aanmeldenForm.livingArea}
                      onChange={(v) => updateAanmelden('livingArea', v)}
                    />
                    <LuxuryInput
                      label="Perceeloppervlakte m²"
                      value={aanmeldenForm.plotArea}
                      onChange={(v) => updateAanmelden('plotArea', v)}
                    />
                    <LuxuryInput
                      label="Slaapkamers"
                      value={aanmeldenForm.bedrooms}
                      onChange={(v) => updateAanmelden('bedrooms', v)}
                    />
                    <LuxuryInput
                      label="Energielabel"
                      value={aanmeldenForm.energyLabel}
                      onChange={(v) => updateAanmelden('energyLabel', v)}
                    />
                  </div>

                  <LuxuryTextarea
                    label="Luxe kenmerken"
                    rows={4}
                    placeholder="Bijvoorbeeld: wellness, buitenzwembad, guesthouse, wijnkelder, lift, thuisbioscoop, eigen steiger..."
                    value={aanmeldenForm.luxuryFeatures}
                    onChange={(v) => updateAanmelden('luxuryFeatures', v)}
                  />

                  <LuxuryTextarea
                    label="Omschrijving woning"
                    rows={7}
                    placeholder="Omschrijf ligging, afwerking, uitstraling, doelgroep, bijzonderheden en extra verkooppunten."
                    value={aanmeldenForm.description}
                    onChange={(v) => updateAanmelden('description', v)}
                  />

                  <LuxuryTextarea
                    label="Extra opmerkingen"
                    rows={4}
                    placeholder="Interne opmerkingen voor team Vastgoed Exclusief."
                    value={aanmeldenForm.notes}
                    onChange={(v) => updateAanmelden('notes', v)}
                  />

                  <div className="rounded-[28px] border border-dashed border-[#cfdbeb] bg-[linear-gradient(180deg,#fbfdff_0%,#f6f9fd_100%)] p-5">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-[#153c75] shadow-sm">
                        <ImagePlus className="h-6 w-6" />
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[#102c54]">
                          Foto’s uploaden
                        </h3>
                        <p className="mt-1 text-sm leading-6 text-[#64748b]">
                          Voeg maximaal 10 woningfoto’s toe.
                        </p>

                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleFiles}
                          className="mt-4 block w-full rounded-2xl border border-[#d7e1f0] bg-white px-4 py-3 text-sm text-[#102c54] file:mr-4 file:rounded-full file:border-0 file:bg-[#153c75] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#102c54]"
                        />

                        <div className="mt-4 flex flex-wrap gap-2">
                          {files.length ? (
                            files.map((file, index) => (
                              <span
                                key={`${file.name}-${index}`}
                                className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#153c75] shadow-sm"
                              >
                                <FileImage className="h-3.5 w-3.5" />
                                {file.name}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full bg-white px-3 py-1.5 text-xs text-[#64748b] shadow-sm">
                              Nog geen bestanden geselecteerd
                            </span>
                          )}
                        </div>

                        <div className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm text-[#5b6b82]">
                          Geselecteerd: <strong>{files.length}</strong> / 10 foto’s
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                    <LuxuryInput
                      label="Bedrijfsnaam *"
                      value={mutatieForm.companyName}
                      onChange={(v) => updateMutatie('companyName', v)}
                    />
                    <LuxuryInput
                      label="Contactpersoon *"
                      value={mutatieForm.contactName}
                      onChange={(v) => updateMutatie('contactName', v)}
                    />
                    <LuxuryInput
                      label="E-mailadres *"
                      type="email"
                      value={mutatieForm.email}
                      onChange={(v) => updateMutatie('email', v)}
                    />
                    <LuxuryInput
                      label="Telefoonnummer"
                      value={mutatieForm.phone}
                      onChange={(v) => updateMutatie('phone', v)}
                    />
                    <LuxuryInput
                      label="Straat + huisnummer *"
                      value={mutatieForm.address}
                      onChange={(v) => updateMutatie('address', v)}
                    />
                    <LuxuryInput
                      label="Plaats *"
                      value={mutatieForm.city}
                      onChange={(v) => updateMutatie('city', v)}
                    />

                    {activeAction === 'prijswijziging' && (
                      <>
                        <LuxuryInput
                          label="Huidige prijs"
                          value={mutatieForm.currentPrice}
                          onChange={(v) => updateMutatie('currentPrice', v)}
                        />
                        <LuxuryInput
                          label="Nieuwe prijs *"
                          value={mutatieForm.newPrice}
                          onChange={(v) => updateMutatie('newPrice', v)}
                        />
                      </>
                    )}

                    {activeAction === 'afmelden' && (
                      <>
                        <LuxuryInput
                          label="Prijs waarvoor verkocht *"
                          value={mutatieForm.soldPrice}
                          onChange={(v) => updateMutatie('soldPrice', v)}
                        />
                        <LuxuryInput
                          label="Datum verkocht"
                          type="date"
                          value={mutatieForm.statusDate}
                          onChange={(v) => updateMutatie('statusDate', v)}
                        />
                      </>
                    )}

                    {activeAction === 'onder-bod' && (
                      <LuxuryInput
                        label="Datum statuswijziging"
                        type="date"
                        value={mutatieForm.statusDate}
                        onChange={(v) => updateMutatie('statusDate', v)}
                      />
                    )}
                  </div>

                  <LuxuryTextarea
                    label={
                      activeAction === 'wijzigen'
                        ? 'Omschrijf de gewenste wijziging'
                        : activeAction === 'afmelden'
                        ? 'Toelichting verkocht'
                        : activeAction === 'onder-bod'
                        ? 'Toelichting onder bod'
                        : 'Toelichting prijswijziging'
                    }
                    rows={6}
                    placeholder="Voeg hier een duidelijke toelichting toe voor de verwerking."
                    value={mutatieForm.notes}
                    onChange={(v) => updateMutatie('notes', v)}
                  />
                </>
              )}

              <div className="flex flex-col gap-3 border-t border-[#edf2f8] pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-[#64748b]">
                  Deze centrale beheerpagina is gebouwd als premium workflow voor
                  snelle website-aanpassingen.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#102c54] to-[#1b4b8f] px-6 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(16,44,84,0.25)] transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send className="h-4 w-4" />
                  {isSubmitting ? 'Bezig met verzenden...' : 'Actie voorbereiden'}
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}

function VisualStatusBadge({ status }: { status: VisualPropertyStatus }) {
  const styles =
    status === 'actief'
      ? 'bg-emerald-100 text-emerald-700'
      : status === 'onder-bod'
      ? 'bg-amber-100 text-amber-800'
      : status === 'verkocht'
      ? 'bg-rose-100 text-rose-700'
      : 'bg-fuchsia-100 text-fuchsia-700';

  const label =
    status === 'actief'
      ? 'Actief'
      : status === 'onder-bod'
      ? 'Onder bod'
      : status === 'verkocht'
      ? 'Verkocht'
      : 'Prijswijziging';

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {label}
    </span>
  );
}

function MiniInfo({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f8fbff] p-3">
      <div className="flex items-center gap-2 text-[#153c75]">
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="mt-2 text-sm font-semibold text-[#102c54]">{value}</p>
    </div>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#dce6f3] bg-[#fbfdff] px-4 py-3 text-sm font-medium text-[#153c75] transition hover:border-[#c9d8eb] hover:bg-white"
    >
      {icon}
      {label}
    </button>
  );
}

function GlassStatPill({
  icon,
  text,
}: {
  icon: ReactNode;
  text: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-2 text-sm text-[#153c75] shadow-sm backdrop-blur-xl">
      {icon}
      {text}
    </div>
  );
}

function LuxuryInput({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  const icon =
    type === 'email' ? (
      <Mail className="h-4 w-4" />
    ) : type === 'date' ? (
      <Clock3 className="h-4 w-4" />
    ) : label.toLowerCase().includes('telefoon') ? (
      <Phone className="h-4 w-4" />
    ) : label.toLowerCase().includes('plaats') ||
      label.toLowerCase().includes('adres') ? (
      <MapPin className="h-4 w-4" />
    ) : (
      <Home className="h-4 w-4" />
    );

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#102c54]">
        {label}
      </span>
      <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#d9e2ef] bg-[#fbfcff] px-4 transition focus-within:border-[#153c75] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#153c75]/10">
        <span className="text-[#7b8aa3]">{icon}</span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-full w-full bg-transparent text-sm text-[#102c54] outline-none placeholder:text-[#94a3b8]"
        />
      </div>
    </label>
  );
}

function LuxuryTextarea({
  label,
  value,
  onChange,
  rows = 5,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#102c54]">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-[24px] border border-[#d9e2ef] bg-[#fbfcff] px-4 py-3 text-sm leading-6 text-[#102c54] outline-none transition placeholder:text-[#94a3b8] focus:border-[#153c75] focus:bg-white focus:ring-4 focus:ring-[#153c75]/10"
      />
    </label>
  );
}
