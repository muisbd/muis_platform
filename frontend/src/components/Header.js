'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export default function Header() {
  const pathname = usePathname() || '/';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const { user, isLoggedIn, isStaff, isMember, isPendingMember, logout, ready } = useAuth();

  const isHomePage = pathname === '/' || pathname === '' || pathname === '/index.html';
  const isHeroPage = isHomePage || pathname.startsWith('/sirah-2026');
  const headerClass = isHeroPage ? 'header header-transparent' : 'header header-inner';

  const getActiveClass = (route) => {
    if (route === '/' && isHomePage) return 'active';
    if (route === '/events-programs' && pathname.startsWith('/sirah-2026')) return 'active';
    return pathname.startsWith(route) && route !== '/' ? 'active' : '';
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setAccountOpen(false);
    document.body.style.overflow = '';
  }, [pathname]);

  const toggleMenu = () => {
    setMenuOpen((open) => {
      const next = !open;
      document.body.style.overflow = next ? 'hidden' : '';
      return next;
    });
  };

  const closeMenu = () => {
    setMenuOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <header className={`${headerClass}${scrolled ? ' scrolled' : ''}`}>
      <div className="container nav-container">
        <Link href="/" className="nav-logo" title="Back to Homepage">
          <img src="/muis_logo_white.png" alt="Metropolitan University Islamic Society Logo" />
        </Link>

        <nav>
          <ul className={`nav-menu${menuOpen ? ' open' : ''}`}>
            <li><Link href="/" className={`nav-link ${getActiveClass('/')}`} onClick={closeMenu}>Home</Link></li>
            <li><Link href="/about" className={`nav-link ${getActiveClass('/about')}`} onClick={closeMenu}>About</Link></li>
            <li><Link href="/events-programs" className={`nav-link ${getActiveClass('/events-programs')}`} onClick={closeMenu}>Events & Programs</Link></li>
            <li><Link href="/courses" className={`nav-link ${getActiveClass('/courses')}`} onClick={closeMenu}>Islamic Courses</Link></li>
            <li><Link href="/blogs" className={`nav-link ${getActiveClass('/blogs')}`} onClick={closeMenu}>Blogs</Link></li>
            <li><Link href="/contact" className={`nav-link ${getActiveClass('/contact')}`} onClick={closeMenu}>Contact</Link></li>
            <li className="nav-mobile-only"><Link href="/donate" className={`nav-link nav-link-donate ${getActiveClass('/donate')}`} onClick={closeMenu}>Donate Now</Link></li>
            {isLoggedIn ? (
              <>
                {isStaff ? <li className="nav-mobile-only"><Link href="/admin" className={`nav-link ${getActiveClass('/admin')}`} onClick={closeMenu}>Admin</Link></li> : null}
                <li className="nav-mobile-only"><button type="button" className="nav-link" onClick={() => { closeMenu(); logout(); }}>Logout</button></li>
              </>
            ) : (
              <li className="nav-mobile-only"><Link href="/login" className={`nav-link ${getActiveClass('/login')}`} onClick={closeMenu}>Login</Link></li>
            )}
          </ul>
        </nav>

        <div className="nav-actions">
          <Link href="/donate" className="btn btn-emerald btn-sm nav-donate-btn">Donate</Link>
          {ready && isLoggedIn ? (
            <>
              {isStaff ? <Link href="/admin" className="btn btn-sm btn-gold nav-auth-btn">Admin</Link> : null}
              <div className="nav-account">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-white nav-auth-btn"
                  aria-expanded={accountOpen}
                  onClick={() => setAccountOpen((o) => !o)}
                >
                  {user?.name?.split(' ')[0] || 'Account'}
                </button>
                {accountOpen ? (
                  <div className="nav-account-menu">
                    {isMember ? <Link href="/courses" onClick={() => setAccountOpen(false)}>Courses</Link> : null}
                    {isPendingMember ? <span>Membership pending review</span> : null}
                    <button type="button" onClick={() => { setAccountOpen(false); logout(); }}>Logout</button>
                  </div>
                ) : null}
              </div>
            </>
          ) : ready ? (
            <Link href="/login" className="btn btn-sm btn-outline-white nav-auth-btn">Login</Link>
          ) : null}
          <button
            className="mobile-toggle"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
          >
            <Menu />
          </button>
        </div>
      </div>
    </header>
  );
}
