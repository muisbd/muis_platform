import PageHeader from './PageHeader.js';
import Contact from './Contact.js';
import Faq from './Faq.js';

export default function ContactPage() {
  return (
    <div className="page-container page-fade-enter">
      <PageHeader title="Contact MUIS & Musalla Info" description="Get in touch with committee officers, request information, or find directions to the campus prayer room." />

      <div style={{ marginTop: -30 }}>
        <Contact />
      </div>

      <div style={{ marginTop: 30 }}>
        <Faq />
      </div>
    </div>
  );
}
