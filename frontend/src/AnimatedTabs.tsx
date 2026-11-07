import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

/* ---------- Tab bar with sliding orange pill ---------- */
export type TabItem<T extends string = string> = { id: T; label: string; badge?: number };

export function AnimatedTabs<T extends string>({
  tabs, active, onChange,
}: { tabs: TabItem<T>[]; active: T; onChange: (id: T) => void }) {
  return (
    <div className="tabs">
      {tabs.map((t) => (
        <button key={t.id} className={`tab ${active === t.id ? 'active' : ''}`} onClick={() => onChange(t.id)}>
          {active === t.id && (
            <motion.div
              layoutId="tab-pill"
              className="tab-pill"
              transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            />
          )}
          <span>
            {t.label}
            {t.badge ? <i className="tab-badge">{t.badge}</i> : null}
          </span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Page transition: fade + slide + soft blur ---------- */
export function TabContent({ tabKey, children }: { tabKey: string; children: ReactNode }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tabKey}
        initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ---------- Cards ek ek karke aayein (stagger) ---------- */
const container = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } };
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

export function Stagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={container} initial="hidden" animate="show">
      {children}
    </motion.div>
  );
}

export function Item({ children, className }: { children: ReactNode; className?: string }) {
  return <motion.div className={className} variants={item}>{children}</motion.div>;
}
