'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, X, Filter, RotateCcw } from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce';
import { useTranslations } from 'next-intl';

interface PropertyFiltersProps {
  currentSearch: string;
  currentStatus: 'active' | 'deleted' | 'all';
  currentPropertyType: string;
  currentProvince: string;
  currentMinPrice?: number;
  currentMaxPrice?: number;
  propertyTypes: string[];
  provinces: string[];
}

export function PropertyFilters({
  currentSearch,
  currentStatus,
  currentPropertyType,
  currentProvince,
  currentMinPrice,
  currentMaxPrice,
  propertyTypes,
  provinces,
}: PropertyFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('properties.filters');
  const [search, setSearch] = useState(currentSearch);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const updateUrl = useCallback((updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString());

    // Reset to page 1 when filters change
    params.set('page', '1');

    Object.entries(updates).forEach(([key, value]) => {
      if (value && value !== 'all' && value !== '') {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const debouncedSearch = useDebouncedCallback((value: string) => {
    updateUrl({ search: value });
  }, 300);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    debouncedSearch(value);
  };

  const handleStatusChange = (value: string) => {
    updateUrl({ status: value });
  };

  const handlePropertyTypeChange = (value: string) => {
    updateUrl({ propertyType: value });
  };

  const handleProvinceChange = (value: string) => {
    updateUrl({ province: value });
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateUrl({ minPrice: value });
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    updateUrl({ maxPrice: value });
  };

  const clearAllFilters = () => {
    setSearch('');
    router.push('?', { scroll: false });
  };

  const hasActiveFilters = currentSearch || currentStatus !== 'active' ||
    currentPropertyType !== 'all' || currentProvince !== 'all' ||
    currentMinPrice !== undefined || currentMaxPrice !== undefined;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={search}
            onChange={handleSearchChange}
            className="pl-10 pr-10"
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                updateUrl({ search: '' });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={currentStatus} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder={t('status')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t('activeOnly')}</SelectItem>
            <SelectItem value="deleted">{t('deletedOnly')}</SelectItem>
            <SelectItem value="all">{t('allProperties')}</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          {showAdvanced ? t('hideFilters') : t('moreFilters')}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearAllFilters}
            className="gap-2 text-gray-500 hover:text-gray-700"
          >
            <RotateCcw className="h-4 w-4" />
            {t('clear')}
          </Button>
        )}
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">{t('propertyType')}</label>
            <Select value={currentPropertyType} onValueChange={handlePropertyTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('allTypes')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                {propertyTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">{t('province')}</label>
            <Select value={currentProvince} onValueChange={handleProvinceChange}>
              <SelectTrigger>
                <SelectValue placeholder={t('allProvinces')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allProvinces')}</SelectItem>
                {provinces.map((prov) => (
                  <SelectItem key={prov} value={prov}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">{t('minPrice')}</label>
            <Input
              type="number"
              placeholder="0"
              defaultValue={currentMinPrice || ''}
              onChange={handleMinPriceChange}
              min={0}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">{t('maxPrice')}</label>
            <Input
              type="number"
              placeholder={t('noLimit')}
              defaultValue={currentMaxPrice || ''}
              onChange={handleMaxPriceChange}
              min={0}
            />
          </div>
        </div>
      )}
    </div>
  );
}
