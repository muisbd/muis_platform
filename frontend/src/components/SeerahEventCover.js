import SeerahContestPoster from './SeerahContestPoster.js';
import { SEERAH_CONFERENCE_SLIDE } from '../data/sirahSpeakers.js';

export default function SeerahEventCover({ className = '' }) {
  if (!SEERAH_CONFERENCE_SLIDE) return null;

  return (
    <div className={`seerah-event-cover ${className}`.trim()}>
      <SeerahContestPoster slide={SEERAH_CONFERENCE_SLIDE} variant="cover" />
    </div>
  );
}
