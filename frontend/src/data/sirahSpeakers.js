export const SIRAH_SPEAKERS = [
  {
    name: 'Jakariya Masud',
    title: "Writer, Da'e, Activist",
    photo: 'https://res.cloudinary.com/daqvhd097/image/upload/v1789963309/FB_IMG_1789905218757_f1hsc3.png'
  },
  {
    name: 'Mufti Ziaur Rahman',
    title: 'Chairman, Sianah Trust',
    photo: 'https://res.cloudinary.com/daqvhd097/image/upload/v1789963310/FB_IMG_1789905242063_iduwgu.png'
  }
];

export const SIRAH_SLIDES = [
  {
    image: '/images/event.jpg',
    title: 'Glimpse of our Seerah Conference 2025',
    caption: 'Moments from MUIS Seerah Conference 2025.'
  },
  {
    image: 'https://res.cloudinary.com/daqvhd097/image/upload/v1789964075/568644598_122110779711016513_2371353618610638604_n_uhoac7.jpg',
    title: 'Glimpse of our Seerah Conference 2025',
    caption: 'Moments from MUIS Seerah Conference 2025.',
    position: 'center 28%'
  },
  {
    image: 'https://res.cloudinary.com/daqvhd097/image/upload/v1789964076/571117668_122110779621016513_6354018306979348945_n_fd7fc9.jpg',
    title: 'Glimpse of our Seerah Conference 2025',
    caption: 'Moments from MUIS Seerah Conference 2025.',
    position: 'center bottom'
  },
  {
    image: 'https://res.cloudinary.com/daqvhd097/image/upload/v1789964076/569270108_122110779585016513_8802642635204771756_n_gsyss2.jpg',
    title: 'Glimpse of our Seerah Conference 2025',
    caption: 'Moments from MUIS Seerah Conference 2025.'
  },
  {
    image: 'https://res.cloudinary.com/daqvhd097/image/upload/v1789964077/569099922_122110779669016513_6902771257759652160_n_ouyf3d.jpg',
    title: 'Glimpse of our Seerah Conference 2025',
    caption: 'Moments from MUIS Seerah Conference 2025.'
  }
];

export const WRITING_CONTEST_DEADLINE_BN = '১৪ অক্টোবর 2026';
export const WRITING_CONTEST_DEADLINE_EN = '14 October 2026';
export const WRITING_CONTEST_DEADLINE_SHORT = '14 Oct';

export const SEERAH_CAROUSEL = [
  {
    id: 'conference',
    kind: 'contest',
    kicker: 'Highlights · 17 October',
    line1: 'Seerah',
    line2: '2026',
    highlights: ['Seerah Quiz', 'Writing Contest', 'Seerah Seminar'],
    caption: `এক রেজিস্ট্রেশনেই তিন আয়োজন। কুইজ, রাইটিং কনটেস্ট ও সেমিনার। রাইটিং কনটেস্টের শেষ সময় ${WRITING_CONTEST_DEADLINE_BN}।`,
    accent: 'conference'
  },
  {
    id: 'quiz',
    kind: 'contest',
    kicker: 'Quiz · 17 October',
    line1: 'Seerah',
    line2: 'Quiz',
    caption: 'MCQ ও সংক্ষিপ্ত প্রশ্ন। সিলেবাস: সীরাতে খাতামুল আম্বিয়া। ১৭ অক্টোবর, সকাল ১১টা।',
    accent: 'quiz'
  },
  {
    id: 'writing',
    kind: 'contest',
    kicker: `Contest · Deadline ${WRITING_CONTEST_DEADLINE_SHORT}`,
    line1: 'Seerah',
    line2: 'Writing',
    caption: `রাসূলুল্লাহ ﷺ-এর জীবনী থেকে সর্বোচ্চ ২০০ শব্দে লিখুন। জমা দেওয়ার শেষ সময় ${WRITING_CONTEST_DEADLINE_BN}। ই-মেইল অথবা ফেসবুক ইনবক্সে পাঠান।`,
    accent: 'writing'
  },
  {
    id: 'seminar',
    kind: 'contest',
    kicker: 'Seminar · 17 October',
    line1: 'Seerah',
    line2: 'Seminar',
    guests: ['Jakariya Masud', 'Mufti Ziaur Rahman'],
    caption: 'শনিবার দুইটি সেশন, যোহরের সালাত ও লাঞ্চ, অংশগ্রহণকারীদের জন্য বাসের ব্যবস্থা।',
    accent: 'seminar'
  }
];

export const SEERAH_CONFERENCE_SLIDE = SEERAH_CAROUSEL.find((item) => item.id === 'conference');
