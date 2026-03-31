'use client';

import { useState } from 'react';

export default function NewPropertyPage() {
  const [form, setForm] = useState({
    address: '',
    city: '',
    postalCode: '',
    price: '',
  });

  return (
    <div className="px-6 py-8">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-[#102c54]">
          Nieuwe woning aanmelden
        </h1>
        <p className="mt-2 text-lg text-slate-500">
          Vul hieronder de gegevens van de woning in
        </p>
      </div>

      {/* CARD */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {/* TITEL BLOK */}
        <h2 className="mb-6 text-2xl font-semibold text-[#102c54]">
          Woninggegevens
        </h2>

        {/* HOOFDFOTO */}
        <div className="mb-8">
          <label className="mb-2 block text-sm font-medium text-slate-700">
            Hoofdfoto woning
          </label>

          <div className="rounded-xl border border-dashed border-slate-300 p-6 text-center">
            <input type="file" className="mb-3" />
            <p className="text-sm text-slate-500">
              Upload hier de hoofdfoto van de woning
            </p>
          </div>
        </div>

        {/* FORM GRID */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* ADRES */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Adres
            </label>
            <input
              type="text"
              placeholder="Hoofdstraat 123"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={form.address}
              onChange={(e) =>
                setForm({ ...form, address: e.target.value })
              }
            />
          </div>

          {/* STAD */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Stad
            </label>
            <input
              type="text"
              placeholder="Amsterdam"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={form.city}
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
            />
          </div>

          {/* POSTCODE */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Postcode
            </label>
            <input
              type="text"
              placeholder="1234 AB"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={form.postalCode}
              onChange={(e) =>
                setForm({ ...form, postalCode: e.target.value })
              }
            />
          </div>

          {/* PRIJS */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Vraagprijs (€)
            </label>
            <input
              type="number"
              placeholder="1250000"
              className="w-full rounded-xl border border-slate-300 px-3 py-2"
              value={form.price}
              onChange={(e) =>
                setForm({ ...form, price: e.target.value })
              }
            />
          </div>
        </div>

        {/* BUTTON */}
        <div className="mt-8 flex justify-end">
          <button className="rounded-xl bg-[#102c54] px-6 py-3 font-semibold text-white hover:bg-[#0c2342]">
            Woning opslaan
          </button>
        </div>
      </div>
    </div>
  );
}
