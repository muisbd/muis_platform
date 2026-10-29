'use client';

import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, ZoomIn, ZoomOut, RotateCcw, Save, MoveHorizontal } from 'lucide-react';
import SeerahCertificateImage from './SeerahCertificateImage.js';
import { NAME_FONTS, DEFAULT_NAME_STYLE } from '../lib/seerahCertificate.js';

const SHARED_STEP = { x: 0.004, y: 0.003, size: 0.002, maxWidth: 0.02 };
const PERSON_STEP = { dx: 0.004, dy: 0.003, scale: 0.04 };
const round = (n) => Math.round(n * 10000) / 10000;

/**
 * mode="shared": moves the name for every certificate.
 * mode="person": fine-tunes one certificate on top of the shared position.
 */
export default function CertificateNameEditor({ mode, sharedStyle, personStyle, name, onSave, onCancel, busy }) {
  const [style, setStyle] = useState({ ...DEFAULT_NAME_STYLE, ...(sharedStyle || {}) });
  const [person, setPerson] = useState({ scale: 1, dx: 0, dy: 0, ...(personStyle || {}) });
  const [previewName, setPreviewName] = useState(name || 'Muhammad Abdullah Al Mamun');
  const isShared = mode === 'shared';

  const nudgeShared = (key, dir) => setStyle((s) => ({ ...s, [key]: round(s[key] + dir * SHARED_STEP[key]) }));
  const nudgePerson = (key, dir) => setPerson((p) => ({ ...p, [key]: round(p[key] + dir * PERSON_STEP[key]) }));

  const move = (axis, dir) => (isShared ? nudgeShared(axis === 'x' ? 'x' : 'y', dir) : nudgePerson(axis === 'x' ? 'dx' : 'dy', dir));
  const resize = (dir) => (isShared ? nudgeShared('size', dir) : nudgePerson('scale', dir));

  return (
    <div className="cert-editor">
      <div className="cert-editor-preview">
        <SeerahCertificateImage name={previewName} style={style} personStyle={isShared ? null : person} />
      </div>
      <div className="cert-editor-controls">
        <div className="form-group">
          <label>{isShared ? 'Preview with this name (try a long one)' : 'Name on this certificate'}</label>
          <input className="form-control" value={previewName} onChange={(e) => setPreviewName(e.target.value)} />
        </div>

        <div className="cert-editor-pad">
          <button type="button" className="btn btn-sm btn-outline pad-up" onClick={() => move('y', -1)} aria-label="Move up"><ArrowUp /></button>
          <button type="button" className="btn btn-sm btn-outline pad-left" onClick={() => move('x', -1)} aria-label="Move left"><ArrowLeft /></button>
          <button type="button" className="btn btn-sm btn-outline pad-right" onClick={() => move('x', 1)} aria-label="Move right"><ArrowRight /></button>
          <button type="button" className="btn btn-sm btn-outline pad-down" onClick={() => move('y', 1)} aria-label="Move down"><ArrowDown /></button>
        </div>

        <div className="cert-editor-row">
          <button type="button" className="btn btn-sm btn-outline" onClick={() => resize(1)}><ZoomIn /> Bigger</button>
          <button type="button" className="btn btn-sm btn-outline" onClick={() => resize(-1)}><ZoomOut /> Smaller</button>
        </div>

        {isShared ? (
          <>
            <div className="cert-editor-row">
              <button type="button" className="btn btn-sm btn-outline" onClick={() => nudgeShared('maxWidth', 1)}><MoveHorizontal /> Wider fit</button>
              <button type="button" className="btn btn-sm btn-outline" onClick={() => nudgeShared('maxWidth', -1)}><MoveHorizontal /> Narrower fit</button>
            </div>
            <p className="admin-meta">Long names shrink automatically to fit the width. “Wider / Narrower fit” changes that width.</p>
            <div className="form-grid-2">
              <div className="form-group">
                <label>Font</label>
                <select className="form-control" value={style.font} onChange={(e) => setStyle((s) => ({ ...s, font: e.target.value }))}>
                  {Object.entries(NAME_FONTS).map(([key, f]) => <option key={key} value={key}>{f.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Colour</label>
                <input type="color" className="form-control cert-color" value={style.color} onChange={(e) => setStyle((s) => ({ ...s, color: e.target.value }))} />
              </div>
            </div>
          </>
        ) : (
          <p className="admin-meta">Size {Math.round(person.scale * 100)}% · these changes apply only to this person.</p>
        )}

        <div className="cert-editor-row">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => (isShared ? setStyle({ ...DEFAULT_NAME_STYLE }) : setPerson({ scale: 1, dx: 0, dy: 0 }))}
          >
            <RotateCcw /> Reset
          </button>
          {onCancel ? <button type="button" className="btn btn-sm btn-outline" onClick={onCancel}>Close</button> : null}
          <button
            type="button"
            className="btn btn-sm btn-emerald"
            disabled={busy}
            onClick={() => (isShared
              ? onSave({ nameStyle: style })
              : onSave({ certName: previewName, nameStyle: person.scale === 1 && !person.dx && !person.dy ? null : person }))}
          >
            <Save /> {isShared ? 'Save for all certificates' : 'Save for this person'}
          </button>
        </div>
      </div>
    </div>
  );
}
