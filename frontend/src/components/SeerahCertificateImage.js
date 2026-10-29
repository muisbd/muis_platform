'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { drawCertificate, canvasToBlob, certificateFileName } from '../lib/seerahCertificate.js';
import { showToast } from '../utils/toast.js';

export default function SeerahCertificateImage({ name, style, personStyle, showActions = false }) {
  const canvas = useRef(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    drawCertificate(canvas.current, { name, style, personStyle })
      .then(() => { if (!cancelled) setReady(true); })
      .catch((err) => { if (!cancelled) setError(err.message); });
    return () => {
      cancelled = true;
    };
  }, [name, style, personStyle]);

  const download = async () => {
    setBusy(true);
    try {
      const blob = await canvasToBlob(canvas.current);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = certificateFileName(name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err) {
      showToast(err.message, true);
    } finally {
      setBusy(false);
    }
  };

  const share = async () => {
    setBusy(true);
    try {
      const blob = await canvasToBlob(canvas.current);
      const file = new File([blob], certificateFileName(name), { type: 'image/png' });
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Seerah Conference 2026 Certificate' });
      } else {
        await download();
      }
    } catch (err) {
      if (err?.name !== 'AbortError') showToast('Sharing is not available here. Use Download instead.', true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cert-image">
      <canvas ref={canvas} className={`cert-canvas${ready ? ' ready' : ''}`} aria-label={`Seerah Conference 2026 certificate for ${name}`} />
      {!ready && !error ? <p className="cert-loading">Preparing certificate…</p> : null}
      {error ? <div className="join-alert alert-error">{error}</div> : null}
      {showActions && ready ? (
        <div className="cert-actions">
          <button type="button" className="btn btn-gold" onClick={download} disabled={busy}>
            <Download /> Download image
          </button>
          <button type="button" className="btn btn-outline" onClick={share} disabled={busy}>
            <Share2 /> Share
          </button>
        </div>
      ) : null}
    </div>
  );
}
