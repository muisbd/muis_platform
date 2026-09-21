'use client';

import Link from 'next/link';
import {
  BookOpen, PenLine, Mic, Bus, Calendar, ArrowRight, CheckCircle2, Utensils
} from 'lucide-react';
import PageHeader from './PageHeader.js';
import SeerahEventCover from './SeerahEventCover.js';
import { SEERAH_CAROUSEL, WRITING_CONTEST_DEADLINE_BN, WRITING_CONTEST_DEADLINE_EN } from '../data/sirahSpeakers.js';
import SeerahContestPoster from './SeerahContestPoster.js';

const QUIZ_SLIDE = SEERAH_CAROUSEL.find((item) => item.id === 'quiz');
const WRITING_SLIDE = SEERAH_CAROUSEL.find((item) => item.id === 'writing');
const SEMINAR_SLIDE = SEERAH_CAROUSEL.find((item) => item.id === 'seminar');

export default function SeerahDetailsPage() {
  return (
    <div className="page-container page-fade-enter seerah-details-page">
      <PageHeader
        title="Seerah Conference 2026"
        description={`17 October · Seerah Quiz, Writing Contest, and Seerah Seminar. Writing contest deadline ${WRITING_CONTEST_DEADLINE_EN}. One registration for all three.`}
        parentPage="Register"
        parentHash="/seerah-2026"
        eyebrow="Event details"
      />

      <section className="section">
        <div className="container seerah-details-wrap">
          <SeerahEventCover className="seerah-details-banner" />

          <article className="seerah-details-copy" lang="bn">
            <h2>সীরাহ কনফারেন্স ২০২৬</h2>
            <p>
              আলহামদুলিল্লাহ, MUIS তৃতীয়বারের মতো আয়োজন করতে যাচ্ছে Seerah Conference 2026, ইনশাআল্লাহ।
            </p>
            <p>এবারের সীরাহ কনফারেন্সে থাকছে তিনটি বিশেষ আয়োজন-</p>
            <ul className="seerah-details-pills">
              <li>সীরাহ কুইজ</li>
              <li>রাইটিং কনটেস্ট · শেষ সময় {WRITING_CONTEST_DEADLINE_BN}</li>
              <li>সীরাহ সেমিনার</li>
            </ul>

            <div className="seerah-details-highlight">
              <strong>এক রেজিস্ট্রেশনেই তিন আয়োজন!</strong>
              <p>
                তিনটি আয়োজনের জন্য আলাদা আলাদা রেজিস্ট্রেশন করার প্রয়োজন নেই। Seerah Conference 2026-এর জন্য একবার রেজিস্ট্রেশন করলেই আপনি স্বয়ংক্রিয়ভাবে সীরাহ সেমিনার, সীরাহ কুইজ এবং রাইটিং কনটেস্ট- তিনটিতেই অংশগ্রহণের সুযোগ পাবেন।
              </p>
            </div>

            <section className="seerah-detail-card">
              {QUIZ_SLIDE ? <SeerahContestPoster slide={QUIZ_SLIDE} variant="cover" /> : null}
              <div className="seerah-detail-card-head">
                <BookOpen />
                <h3>সীরাহ কুইজ</h3>
              </div>
              <p>সীরাহ সেমিনার শুরুর আগে ১৭ অক্টোবর অনুষ্ঠিত হবে সীরাহ কুইজ।</p>
              <p>কুইজে থাকবে MCQ ও সংক্ষিপ্ত প্রশ্নের উত্তর।</p>
              <p><strong>সিলেবাস:</strong> সীরাতে খাতামুল আম্বিয়া</p>
              <p className="seerah-details-note">রেজিস্ট্রেশনকারী প্রত্যেককে বইটি বিনামূল্যে প্রদান করা হবে।</p>
            </section>

            <section className="seerah-detail-card">
              {WRITING_SLIDE ? <SeerahContestPoster slide={WRITING_SLIDE} variant="cover" /> : null}
              <div className="seerah-detail-card-head">
                <PenLine />
                <h3>রাইটিং কনটেস্ট</h3>
              </div>
              <p>
                রাসূলুল্লাহ ﷺ-এর জীবনী থেকে কোনো ঘটনা, শিক্ষা কিংবা অনুভূতিকে সর্বোচ্চ ২০০ শব্দের মধ্যে নিজের লিখায় ফুটিয়ে তুলুন।
              </p>
              <p>
                আপনার লেখা আমাদের ই-মেইল অথবা ফেসবুক পেজের ইনবক্সে পাঠিয়ে দিন।
              </p>
              <p className="seerah-details-note">
                জমা দেওয়ার শেষ সময়: {WRITING_CONTEST_DEADLINE_BN}
              </p>
              <p className="seerah-details-links">
                <a href="mailto:muis@metrouni.edu.bd">muis@metrouni.edu.bd</a>
                {' · '}
                <a href="https://www.facebook.com/muis.sylhet/" target="_blank" rel="noopener noreferrer">Facebook inbox</a>
              </p>
            </section>

            <section className="seerah-detail-card">
              {SEMINAR_SLIDE ? <SeerahContestPoster slide={SEMINAR_SLIDE} variant="cover" /> : null}
              <div className="seerah-detail-card-head">
                <Mic />
                <h3>সীরাহ সেমিনার</h3>
              </div>
              <p>১৭ অক্টোবর, শনিবার অনুষ্ঠিত হবে মূল সীরাহ সেমিনার।</p>
              <p>
                শনিবার হওয়ায় যাতায়াত নিয়ে চিন্তার কারণ নেই- অংশগ্রহণকারীদের জন্য <strong>বাসের</strong> ব্যবস্থা থাকবে, ইনশাআল্লাহ।
              </p>
              <ul className="seerah-schedule">
                <li><Calendar /> সকাল ১১টায় শুরু হবে সীরাহ কুইজ।</li>
                <li><Mic /> কুইজ শেষে শুরু হবে সীরাহ সেমিনারের প্রথম সেশন, যা চলবে যোহরের সালাতের আগ পর্যন্ত।</li>
                <li><Utensils /> এরপর থাকবে যোহরের সালাত ও লাঞ্চের বিরতি। বিরতির পর শুরু হবে দ্বিতীয় সেশন।</li>
                <li><CheckCircle2 /> দুইটি সেশন শেষে সীরাহ কুইজ ও রাইটিং কনটেস্টের পুরস্কার বিতরণের মাধ্যমে শেষ হবে এবারের সীরাহ কনফারেন্স, ইনশাআল্লাহ।</li>
                <li><Bus /> অংশগ্রহণকারীদের জন্য বাসের ব্যবস্থা থাকবে।</li>
              </ul>
            </section>
          </article>

          <div className="seerah-details-cta">
            <Link href="/seerah-2026#sirah-register" className="btn btn-gold btn-lg">
              Register now <ArrowRight />
            </Link>
          </div>
        </div>
      </section>

      <div className="sirah-sticky-cta seerah-details-sticky">
        <div className="sirah-sticky-cta-copy">
          <strong>17 Oct · 150 BDT</strong>
          <span>Writing deadline {WRITING_CONTEST_DEADLINE_EN}</span>
        </div>
        <Link href="/seerah-2026#sirah-register" className="btn btn-gold">
          Register
        </Link>
      </div>
    </div>
  );
}
