'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Home, ListChecks, BarChart2, Settings2, Layers } from 'lucide-react';

const NAV = [
  { href: '/dashboard', icon: Home,        label: 'Home'     },
  { href: '/manage',    icon: Layers,       label: 'Manage'   },
  { href: '/timeline',  icon: ListChecks,   label: 'Timeline' },
  { href: '/stats',     icon: BarChart2,    label: 'Stats'    },
  { href: '/settings',  icon: Settings2,    label: 'Settings' },
];

export function BottomNav() {
  const path   = usePathname();
  const router = useRouter();

  useEffect(() => {
    NAV.forEach(item => router.prefetch(item.href));
  }, [router]);

  return (
    <nav className="bottom-nav">
      <div style={{
        height: 'var(--nav-h)', display: 'flex', alignItems: 'center', paddingInline: 4,
      }}>
        {NAV.map((item) => {
          const active = path === item.href || path.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              style={{
                flex: 1,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 3, padding: '5px 0', borderRadius: 12,
                position: 'relative', textDecoration: 'none',
                color: active ? 'var(--ac)' : 'var(--tx-3)',
                transition: 'color 0.12s',
                transform: 'translateZ(0)',
                WebkitTransform: 'translateZ(0)',
              }}
            >
              {active && (
                <motion.div
                  layoutId="nav-active"
                  style={{ position:'absolute', inset:2, background:'var(--ac-dim)', borderRadius:10 }}
                  transition={{ type:'spring', stiffness:500, damping:38 }}
                />
              )}
              <item.icon size={19} strokeWidth={active ? 2.25 : 1.75} style={{ position:'relative', zIndex:1 }} />
              <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.03em', position: 'relative', zIndex: 1 }}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
