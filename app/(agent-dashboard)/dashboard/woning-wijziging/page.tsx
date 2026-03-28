'use client';

import { useEffect } from 'react';

export default function WoningWijzigingPage() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      // @ts-ignore
      if (window.jotformEmbedHandler) {
        // @ts-ignore
        window.jotformEmbedHandler(
          "iframe[id='JotFormIFrame-260464976624366']",
          "https://form.jotform.com/"
        );
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Woning wijziging
        </h1>
        <p className="text-sm text-muted-foreground">
          Geef wijzigingen door voor een bestaande woning.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4">
        <iframe
          id="JotFormIFrame-260464976624366"
          title="Woning wijziging"
          src="https://form.jotform.com/260464976624366"
          style={{
            minWidth: '100%',
            maxWidth: '100%',
            height: '600px',
            border: 'none',
          }}
          allow="geolocation; microphone; camera; fullscreen; payment"
        />
      </div>
    </div>
  );
}

