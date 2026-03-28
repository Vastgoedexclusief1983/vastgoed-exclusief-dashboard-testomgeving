'use client';

import { useEffect, useMemo, useState } from 'react';

type SaleItem = {
  _id: string;
  agentId: string;
  agentName?: string | null;
  address: string;
  soldPrice: number;
  soldAt?: string | null;
  notes?: string;
  createdAt: string;
};

function euro(n: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(n);
}

export default function WoningAfmeldenClient() {
  const [address, setAddress] = useState('');
  const [soldPrice, setSoldPrice] = useState('');
  const [soldAt, setSoldAt] = useState('');
  const [notes, setNotes] = useState('');

  const [items, setItems] = useState<SaleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const price = Number(soldPrice);
    return address.trim().length > 3 && Number.isFinite(price) && price > 0;
  }, [address, soldPrice]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // ✅ Geen agentId meer meesturen: API bepaalt agent via NextAuth session
      const res = await fetch('/api/sales', { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Ophalen mislukt');
      setItems(Array.isArray(data?.items) ? data.items : []);
    } catch (e: any) {
      setError(e?.message || 'Ophalen mislukt');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // ✅ Geen agentId/agentName meer: server haalt dit uit session
        body: JSON.stringify({
          address,
          soldPrice: Number(soldPrice),
          soldAt: soldAt || null,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Opslaan mislukt');

      setAddress('');
      setSoldPrice('');
      setSoldAt('');
      setNotes('');

      await load();
    } catch (e: any) {
      setError(e?.message || 'Opslaan mislukt');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Formulier */}
      <div className="rounded-2xl border bg-white p-6">
        <h2 className="text-lg font-semibold text-[#102c54]">
          Vul hier je verkochte woning in voor je historie verkocht
        </h2>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Adres woning</label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Straat + huisnummer, postcode, plaats"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Verkoopprijs</label>
            <input
              value={soldPrice}
              onChange={(e) => setSoldPrice(e.target.value.replace(/[^\d]/g, ''))}
              inputMode="numeric"
              placeholder="Bijv. 1250000"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Verkoopdatum</label>
            <input
              type="date"
              value={soldAt}
              onChange={(e) => setSoldAt(e.target.value)}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium">Opmerking (optioneel)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Bijzonderheden"
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </div>

          <div className="md:col-span-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={load}
              disabled={loading || saving}
              className="rounded-xl border px-4 py-2 text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Laden…' : 'Ververs'}
            </button>

            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="rounded-xl bg-[#102c54] px-4 py-2 text-sm text-white disabled:opacity-50"
            >
              {saving ? 'Opslaan…' : 'Opslaan als verkocht'}
            </button>
          </div>
        </form>
      </div>

      {/* Historie */}
      <div className="rounded-2xl border bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#102c54]">Historie verkocht</h2>
          <span className="text-sm text-muted-foreground">{items.length} items</span>
        </div>

        {loading ? (
          <div className="mt-4 text-sm text-muted-foreground">Laden…</div>
        ) : items.length === 0 ? (
          <div className="mt-4 text-sm text-muted-foreground">
            Nog geen verkochte woningen gemeld.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Adres</th>
                  <th className="px-4 py-3 font-semibold">Verkoopprijs</th>
                  <th className="px-4 py-3 font-semibold">Verkoopdatum</th>
                  <th className="px-4 py-3 font-semibold">Aangemaakt</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it._id} className="border-t">
                    <td className="px-4 py-3">{it.address}</td>
                    <td className="px-4 py-3">{euro(it.soldPrice)}</td>
                    <td className="px-4 py-3">{it.soldAt || '-'}</td>
                    <td className="px-4 py-3">
                      {new Date(it.createdAt).toLocaleString('nl-NL')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
