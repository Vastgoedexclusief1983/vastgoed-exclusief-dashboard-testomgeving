'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Bed,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
} from 'lucide-react';
import { toast } from 'sonner';
import { PropertyWithAgent } from '@/types/property';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
} from '@/components/ui/pagination';
import { useTranslations } from 'next-intl';

interface ExtendedProperty extends Omit<PropertyWithAgent, 'deletedAt'> {
  isDeleted?: boolean;
  deletedAt?: string | null;
  valuation?: {
    finalPrice?: number;
    addedValue?: number;
    addedValuePercent?: number;
  };
}

interface PropertyTableProps {
  properties: ExtendedProperty[];
  currentPage: number;
  totalPages: number;
  isAdmin?: boolean;
}

export function PropertyTable({
  properties,
  currentPage,
  totalPages,
  isAdmin = false,
}: PropertyTableProps) {
  const router = useRouter();
  const t = useTranslations('properties');
  const tCommon = useTranslations('common');

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<ExtendedProperty | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    }).format(price);

  const handleRowClick = (property: ExtendedProperty) => {
    const basePath = isAdmin ? '/admin/properties' : '/properties';
    router.push(`${basePath}/${property._id}`);
  };

  const handleEdit = (property: ExtendedProperty) => {
    const basePath = isAdmin ? '/admin/properties' : '/properties';
    router.push(`${basePath}/${property._id}/edit`);
  };

  const handleDeleteClick = (property: ExtendedProperty) => {
    setSelectedProperty(property);
    setDeleteDialogOpen(true);
  };

  const handleRestoreClick = (property: ExtendedProperty) => {
    setSelectedProperty(property);
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedProperty) return;

    setIsRestoring(true);
    try {
      const response = await fetch(`/api/properties/${selectedProperty._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore' }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to restore property');
        return;
      }

      toast.success(t('restoreSuccess'));
      setRestoreDialogOpen(false);
      setSelectedProperty(null);
      router.refresh();
    } catch {
      toast.error(tCommon('error'));
    } finally {
      setIsRestoring(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProperty) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/properties/${selectedProperty._id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || 'Failed to delete property');
        return;
      }

      toast.success(t('deleteSuccess'));
      setDeleteDialogOpen(false);
      setSelectedProperty(null);
      router.refresh();
    } catch {
      toast.error(tCommon('error'));
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(window.location.search);
    params.set('page', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 bg-white">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-gray-200">
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.code')}
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                Aanmaakdatum
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.name')}
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.type')}
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.size')}
              </TableHead>
              {isAdmin && (
                <TableHead className="text-sm font-semibold text-gray-700">
                  {t('table.status')}
                </TableHead>
              )}
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.bedrooms')}
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.location')}
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('basePrice')}
              </TableHead>
              <TableHead className="text-sm font-semibold text-gray-700">
                {t('table.price')}
              </TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {properties.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-gray-500 py-8">
                  {t('noProperties')}
                </TableCell>
              </TableRow>
            ) : (
              properties.map((property) => (
                <TableRow
                  key={property._id}
                  className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleRowClick(property)}
                >
                  <TableCell>
                    <Badge variant="outline" className="font-mono text-xs">
                      {property.propertyCode || '-'}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {property.createdAt
                      ? new Date(property.createdAt).toLocaleDateString('nl-NL')
                      : '-'}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                        <div className="w-full h-full bg-white flex items-center justify-center">
                          <span className="text-xs text-gray-400">IMG</span>
                        </div>
                      </div>
                      <span className="font-medium text-gray-900">
                        {property.basicInfo.address}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="text-gray-700">
                    {property.basicInfo.propertyType}
                  </TableCell>

                  <TableCell className="text-gray-700">
                    {property.dimensions.livingArea}m²
                  </TableCell>

                  {isAdmin && (
                    <TableCell>
                      {property.isDeleted ? (
                        <Badge variant="secondary" className="bg-red-50 text-red-700">
                          {t('status.deleted')}
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-green-50 text-green-700">
                          {t('status.active')}
                        </Badge>
                      )}
                    </TableCell>
                  )}

                  <TableCell>
                    <div className="flex items-center gap-1 text-gray-700">
                      <Bed className="w-4 h-4" />
                      <span>{property.dimensions.bedrooms}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-gray-700">
                    {property.basicInfo.city}
                  </TableCell>

                  <TableCell className="text-gray-700">
                    {formatPrice(property.basicInfo.basePrice)}
                  </TableCell>

                  <TableCell className="font-semibold text-gray-900">
                    {property.valuation?.finalPrice ? (
                      <span className="text-green-600">
                        {formatPrice(property.valuation.finalPrice)}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>

                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        {!property.isDeleted && (
                          <>
                            <DropdownMenuItem onClick={() => handleEdit(property)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {tCommon('edit')}
                            </DropdownMenuItem>

                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(property)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {tCommon('delete')}
                            </DropdownMenuItem>
                          </>
                        )}

                        {property.isDeleted && isAdmin && (
                          <DropdownMenuItem
                            onClick={() => handleRestoreClick(property)}
                            className="text-green-600"
                          >
                            <RotateCcw className="mr-2 h-4 w-4" />
                            {tCommon('restore')}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalPages > 1 && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="gap-1 px-2.5 sm:pl-2.5"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:block">{tCommon('previous')}</span>
                  </Button>
                </PaginationItem>

                {currentPage > 2 && (
                  <PaginationItem>
                    <Button variant="ghost" size="icon" onClick={() => handlePageChange(1)}>
                      1
                    </Button>
                  </PaginationItem>
                )}

                {currentPage > 3 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {currentPage > 1 && (
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      {currentPage - 1}
                    </Button>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <Button
                    variant="default"
                    size="icon"
                    className="bg-brand-700 hover:bg-brand-800 text-white"
                  >
                    {currentPage}
                  </Button>
                </PaginationItem>

                {currentPage < totalPages && (
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      {currentPage + 1}
                    </Button>
                  </PaginationItem>
                )}

                {currentPage < totalPages - 2 && (
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                )}

                {currentPage < totalPages - 1 && (
                  <PaginationItem>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handlePageChange(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </PaginationItem>
                )}

                <PaginationItem>
                  <Button
                    variant="outline"
                    size="default"
                    onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="gap-1 px-2.5 sm:pr-2.5"
                  >
                    <span className="hidden sm:block">{tCommon('next')}</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deleteDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('deleteDialog.description', { address: selectedProperty?.basicInfo.address || '' })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              {tCommon('cancel')}
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm} disabled={isDeleting}>
              {isDeleting ? t('deleteDialog.deleting') : tCommon('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('restoreDialog.title')}</DialogTitle>
            <DialogDescription>
              {t('restoreDialog.description', { address: selectedProperty?.basicInfo.address || '' })}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setRestoreDialogOpen(false)} disabled={isRestoring}>
              {tCommon('cancel')}
            </Button>
            <Button
              onClick={handleRestoreConfirm}
              disabled={isRestoring}
              className="bg-green-600 hover:bg-green-700"
            >
              {isRestoring ? t('restoreDialog.restoring') : tCommon('restore')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

