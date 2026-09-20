const BASE = 'https://res.cloudinary.com/daqvhd097/image/upload';
const PUBLIC_ID = 'v1789887425/WhatsApp_Image_2026-09-20_at_12.53.42_PM_foitm3.jpg';

export const SIRAH_BANNER_URL = `${BASE}/f_auto,q_auto,c_limit,w_1600/${PUBLIC_ID}`;
export const SIRAH_BANNER_ALT =
  'Seerah Conference 2026: Seerah Seminar, Seerah Quiz, and Writing Contest at Metropolitan University';

export default function SirahBannerImage({ priority = false, className = 'sirah-banner-img' }) {
  return (
    <img
      className={className}
      src={SIRAH_BANNER_URL}
      srcSet={`${BASE}/f_auto,q_auto,c_limit,w_800/${PUBLIC_ID} 800w, ${BASE}/f_auto,q_auto,c_limit,w_1200/${PUBLIC_ID} 1200w, ${BASE}/f_auto,q_auto,c_limit,w_1600/${PUBLIC_ID} 1600w`}
      sizes="(max-width: 1240px) calc(100vw - 48px), 1144px"
      width={1600}
      height={666}
      alt={SIRAH_BANNER_ALT}
      decoding="async"
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
    />
  );
}
