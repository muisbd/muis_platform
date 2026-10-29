export const SEERAH_TEMPLATE = '/seerah-2026-certificate-template.png';

export const NAME_FONTS = {
  playfair: {
    label: 'Classic serif',
    family: 'Playfair Display',
    weight: 700,
    css: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap'
  },
  tinos: {
    label: 'Times style',
    family: 'Tinos',
    weight: 700,
    css: 'https://fonts.googleapis.com/css2?family=Tinos:wght@700&display=swap'
  },
  greatvibes: {
    label: 'Handwriting',
    family: 'Great Vibes',
    weight: 400,
    css: 'https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap'
  }
};

export const DEFAULT_NAME_STYLE = {
  font: 'playfair',
  color: '#5B2C14',
  x: 0.5,
  y: 0.585,
  size: 0.058,
  maxWidth: 0.53
};

const fontLoads = {};
let templatePromise = null;

function fontOf(key) {
  return NAME_FONTS[key] || NAME_FONTS.playfair;
}

function loadNameFont(key) {
  const font = fontOf(key);
  if (!fontLoads[key]) {
    fontLoads[key] = (async () => {
      let link = document.querySelector(`link[data-cert-font="${key}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = font.css;
        link.dataset.certFont = key;
        await new Promise((resolve) => {
          link.onload = resolve;
          link.onerror = resolve;
          document.head.appendChild(link);
        });
      }
      try {
        await document.fonts.load(`${font.weight} 64px "${font.family}"`);
      } catch {
        /* falls back to a normal serif font */
      }
    })();
  }
  return fontLoads[key];
}

function loadTemplate(src = SEERAH_TEMPLATE) {
  if (!templatePromise) {
    templatePromise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => {
        templatePromise = null;
        reject(new Error('Could not load the certificate template.'));
      };
      img.src = src;
    });
  }
  return templatePromise;
}

/**
 * Draws the template and the name. The name shrinks automatically to fit `maxWidth`,
 * then the per-person `scale`, `dx`, `dy` adjustments from the admin are applied.
 */
export async function drawCertificate(canvas, { name, style, personStyle }) {
  const s = { ...DEFAULT_NAME_STYLE, ...(style || {}) };
  const p = { scale: 1, dx: 0, dy: 0, ...(personStyle || {}) };
  const [img] = await Promise.all([loadTemplate(), loadNameFont(s.font)]);
  const W = img.naturalWidth;
  const H = img.naturalHeight;
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(img, 0, 0, W, H);

  const text = String(name || '').trim();
  if (!text) return;
  const font = fontOf(s.font);
  const setSize = (px) => {
    ctx.font = `${font.weight} ${px}px "${font.family}", "Times New Roman", serif`;
  };
  let size = s.size * H;
  setSize(size);
  const maxWidth = s.maxWidth * W;
  const measured = ctx.measureText(text).width;
  if (measured > maxWidth) size *= maxWidth / measured;
  size *= p.scale;
  setSize(size);
  ctx.fillStyle = s.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(text, (s.x + p.dx) * W, (s.y + p.dy) * H);
}

export function canvasToBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Could not create the image.'))), 'image/png');
  });
}

export function certificateFileName(name) {
  const safe = String(name || 'participant').trim().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-|-$/g, '');
  return `Seerah-Conference-2026-Certificate-${safe || 'participant'}.png`;
}
