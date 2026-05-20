'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { Home, List, BarChart2, Settings2 } from 'lucide-react';

const NAV = [
  { href: '/dashboard', icon: Home,      label: 'Home'     },
  { href: '/timeline',  icon: List,       label: 'Timeline' },
  { href: '/stats',     icon: BarChart2,  label: 'Stats'    },
  { href: '/settings',  icon: Settings2,  label: 'Settings' },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="bottom-nav">
      <div style={{ height: 'var(--nav-h)', display: 'flex', alignItems: 'center', paddingInline: 8 }}>
        {NAV.map((item) => {
          const active = path === item.href || path.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href} style={{
              flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 3, padding: '6px 0', borderRadius: 12, position: 'relative',
              textDecoration: 'none', color: active ? 'var(--ac)' : 'var(--tx-3)',
              transition: 'color 0.15s',
            }}>
              {active && (
                <motion.div layoutId="nav-active"
                  style={{ position: 'absolute', inset: 2, background: 'var(--ac-dim)', borderRadius: 10 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
              <item.icon size={21} strokeWidth={active ? 2.25 : 1.75} style={{ position: 'relative', zIndex: 1 }} />
              <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.03em', position: 'relative', zIndex: 1 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
