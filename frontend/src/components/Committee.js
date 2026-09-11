'use client';

import { useEffect, useState } from 'react';
import { COMMITTEE_DATA } from '../data/committeeData.js';
import { api } from '../lib/api.js';

export default function Committee() {
  const [members, setMembers] = useState(COMMITTEE_DATA);

  useEffect(() => {
    api('/content/committee')
      .then((data) => {
        if (data.members?.length) setMembers(data.members);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="committee" className="section section-bg-surface">
      <div className="container">
        <div className="section-header">
          <div className="eyebrow">Leadership</div>
          <h2>Meet the MUIS Executive Committee</h2>
          <p>Dedicated university students serving our campus community for the 2026–2027 academic term.</p>
        </div>

        <div className="committee-grid">
          {members.map((member) => (
            <div key={member.name + member.role} className="committee-card">
              <div className="committee-avatar">
                <img src={member.avatar} alt={member.name} />
              </div>
              <span className="committee-role">{member.role}</span>
              <h3>{member.name}</h3>
              <div className="committee-dept">{member.dept}</div>
              <div className="committee-quote">&quot;{member.quote}&quot;</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
