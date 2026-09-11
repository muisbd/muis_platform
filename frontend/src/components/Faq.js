'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_DATA } from '../data/faqData.js';
import { api } from '../lib/api.js';

export default function Faq() {
  const [items, setItems] = useState(FAQ_DATA);
  const [openIndex, setOpenIndex] = useState(() => {
    const idx = FAQ_DATA.findIndex((item) => item.isOpen);
    return idx >= 0 ? idx : -1;
  });

  useEffect(() => {
    api('/content/faq')
      .then((data) => {
        if (data.faqs?.length) {
          setItems(data.faqs);
          const idx = data.faqs.findIndex((item) => item.isOpen);
          setOpenIndex(idx >= 0 ? idx : -1);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="section section-bg-surface">
      <div className="container">
        <div className="section-header">
          <div className="eyebrow">Frequently Asked Questions</div>
          <h2>Common Questions About MUIS</h2>
          <p>Everything you need to know about society membership, prayer facilities, and events.</p>
        </div>

        <div className="faq-grid">
            {items.map((item, index) => (
            <div key={item.question} className={`faq-item${openIndex === index ? ' open' : ''}`}>
              <button
                className="faq-question"
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
              >
                <span>{item.question}</span>
                <ChevronDown className="faq-icon" />
              </button>
              <div className="faq-answer">
                {item.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
