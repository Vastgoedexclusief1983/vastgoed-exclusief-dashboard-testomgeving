'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Building2,
  Save,
  Loader2,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { IAgent } from '@/types/agent';
import { useTranslations } from 'next-intl';

interface AgentTableProps {
  agents: IAgent[];
}

type SaveState = {
  loading: boolean;
  success: boolean;
  error: string | null;
};

export function AgentTable({ agents }: AgentTableProps) {
  const router = useRouter();
  const t = useTranslations('agents');
  const tCommon = useTranslations('common');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<IAgent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [creditValues, setCreditValues] = useState<Record<string, string>>(
    Object.fromEntries(
      agents.map((agent) => [
        String(agent._id),
        String((agent as any).monthlyAiLimit ?? 50),
      ])
    )
  );

  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});

  const handleRowClick = (agent: IAgent) => {
    router.push(`/admin/agents/${agent._id}`);
  };

  const handleEdit = (agent: IAgent) => {
    router.push(`/admin/agents/${agent._id}/edit`);
  };

  const handleDeleteClick = (agent: IAgent) => {
    setSelectedAgent(agent);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAgent) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/agents/${selectedAgent._id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to delete agent');
        setIsDeleting(false);
        return;
      }

      toast.success(t('agentDeleted'));
      setDeleteDialogOpen(false);
      setSelectedAgent(null);
      router.refresh();
    } catch (error) {
      toast.error(tCommon('error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreditChange = (agentId: string, value: string) => {
    if (!/^\d*$/.test(value)) return;

    setCreditValues((prev) => ({
      ...prev,
      [agentId]: value,
    }));
  };

  const handleSaveCredits = async (agent: IAgent) => {
    const agentId = String(agent._id);
    const rawValue = creditValues[agentId] ?? '50';
    const parsedValue = Number(rawValue);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
      setSaveStates((prev) => ({
        ...prev,
        [agentId]: {
          loading: false,
          success: false,
          error: 'Voer een geldig aantal credits in.',
        },
      }));
      toast.error('Voer een geldig aantal credits in.');
      return;
    }

    setSaveStates((prev) => ({
      ...prev,
      [agentId]: {
        loading: true,
        success: false,
        error: null,
      },
    }));

    try {
      const response = await fetch(`/api/admin/agents/${agentId}/credits`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          monthlyAiLimit: parsedValue,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        const message =
          result?.error || 'Opslaan van credits is mislukt.';
        setSaveStates((prev) => ({
          ...prev,
          [agentId]: {
            loading: false,
            success: false,
            error: message,
          },
        }));
        toast.error(message);
        return;
      }

      setSaveStates((prev) => ({
        ...prev,
        [agentId]: {
          loading: false,
          success: true,
          error: null,
        },
      }));

      toast.success('Credits opgeslagen');
      router.refresh();

      window.setTimeout(() => {
        setSaveStates((prev) => ({
          ...prev,
          [agentId]: {
            loading: false,
            success: false,
            error: null,
          },
        }));
      }, 1800);
    } catch (error) {
      const message = 'Opslaan van credits is mislukt.';
      setSaveStates((prev) => ({
        ...prev,
        [agentId]: {
          loading: false,
          success: false,
          error: message,
        },
      }));
      toast.error(message);
    }
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.name')}
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.email')}
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.agentCode')}
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.properties')}
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.status')}
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.joined')}
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                Credits p/m
              </TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {agents.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-8 text-center text-gray-500"
                >
                  {t('noAgents')}
                </TableCell>
              </TableRow>
            ) : (
              agents.map((agent) => {
                const agentId = String(agent._id);
                const saveState = saveStates[agentId] ?? {
                  loading: false,
                  success: false,
                  error: null,
                };

                return (
                  <TableRow
                    key={agent._id}
                    className="cursor-pointer border-b border-gray-100 hover:bg-gray-50"
                    onClick={() => handleRowClick(agent)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand-700 to-brand-900 text-sm font-semibold text-white shadow-sm">
                          {agent.firstName?.[0]}
                          {agent.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {agent.firstName} {agent.lastName}
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-gray-700">
                      {agent.email}
                    </TableCell>

                    <TableCell>
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                        {agent.agentCode}
                      </span>
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        <span className="font-medium">
                          {(agent as any).propertyCount || 0}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={agent.isActive ? 'default' : 'secondary'}
                        className={
                          agent.isActive
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700'
                        }
                      >
                        {agent.isActive
                          ? tCommon('active')
                          : tCommon('inactive')}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-gray-700">
                      {format(new Date(agent.createdAt), 'MMM dd, yyyy')}
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="min-w-[220px] space-y-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            inputMode="numeric"
                            value={creditValues[agentId] ?? '50'}
                            onChange={(e) =>
                              handleCreditChange(agentId, e.target.value)
                            }
                            className="h-9 w-24 rounded-md border border-gray-300 px-3 text-sm outline-none focus:border-brand-700"
                            placeholder="50"
                          />

                          <Button
                            type="button"
                            size="sm"
                            className="gap-2"
                            onClick={() => handleSaveCredits(agent)}
                            disabled={saveState.loading}
                          >
                            {saveState.loading ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : saveState.success ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <Save className="h-4 w-4" />
                            )}

                            {saveState.loading
                              ? 'Opslaan...'
                              : saveState.success
                              ? 'Opgeslagen'
                              : 'Opslaan'}
                          </Button>
                        </div>

                        <p className="text-xs text-gray-500">
                          Huidig limiet:{' '}
                          {(agent as any).monthlyAiLimit ?? 50} credits per maand
                        </p>

                        {saveState.error ? (
                          <p className="text-xs text-red-600">
                            {saveState.error}
                          </p>
                        ) : null}
                      </div>
                    </TableCell>

                    <TableCell
                      className="text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(agent)}>
                            <Edit className="mr-2 h-4 w-4" />
                            {tCommon('edit')}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(agent)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {tCommon('delete')}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('deleteDialog.description', {
                name: `${selectedAgent?.firstName || ''} ${
                  selectedAgent?.lastName || ''
                }`,
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? t('deleteDialog.deleting') : tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
