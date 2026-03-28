'use client';

import { useEffect } from 'react';

export default function JotformAfmeldenEmbed() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jotfor.ms/s/umd/latest/for-form-embed-handler.js';
    script.async = true;

    script.onload = () => {
      // @ts-ignore
      window.jotformEmbedHandler?.(
        "iframe[id='JotFormIFrame-260256014056347']",
        'https://form.jotform.com/'
      );
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full rounded-xl overflow-hidden border bg-white shadow-sm">
      <iframe
        id="JotFormIFrame-260256014056347"
        title="Woning afmelden"
        src="https://form.jotform.com/260256014056347"
        allow="geolocation; microphone; camera; fullscreen; payment"
        scrolling="no"
        className="w-full"
        style={{
          minWidth: '100%',
          maxWidth: '100%',
          height: '600px',
          border: 'none',
        }}
        onLoad={() => window.scrollTo(0, 0)}
      />
    </div>
  );
}
