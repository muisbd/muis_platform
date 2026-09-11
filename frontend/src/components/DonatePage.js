import PageHeader from './PageHeader.js';
import Donate from './Donate.js';

export default function DonatePage() {
  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="Support & Donations" description="Help sustain campus prayer spaces, complimentary Ramadan Iftars, and student welfare." />

      <div style={{ marginTop: -10 }}>
        <Donate />
      </div>
    </div>
  );
}
