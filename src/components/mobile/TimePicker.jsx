import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, X } from 'lucide-react';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];
const PERIODS = ['AM', 'PM'];

export default function TimePicker({ value, onChange, className = '' }) {
  const [open, setOpen] = useState(false);

  // Parse HH:MM (24h) to display parts
  const parse = (v) => {
    if (!v) return { h: '12', m: '00', p: 'AM' };
    const [hh, mm] = v.split(':');
    const hour24 = parseInt(hh, 10);
    const period = hour24 >= 12 ? 'PM' : 'AM';
    const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    return { h: String(hour12).padStart(2, '0'), m: mm || '00', p: period };
  };

  const { h, m, p } = parse(value);
  const [selH, setSelH] = useState(h);
  const [selM, setSelM] = useState(m);
  const [selP, setSelP] = useState(p);

  useEffect(() => {
    const { h, m, p } = parse(value);
    setSelH(h); setSelM(m); setSelP(p);
  }, [value]);

  const commit = (nh = selH, nm = selM, np = selP) => {
    let hour24 = parseInt(nh, 10);
    if (np === 'AM' && hour24 === 12) hour24 = 0;
    if (np === 'PM' && hour24 !== 12) hour24 += 12;
    onChange(`${String(hour24).padStart(2, '0')}:${nm}`);
  };

  const displayValue = value ? `${h}:${m} ${p}` : 'Set time';

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 text-sm text-foreground ${className}`}
      >
        <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
        <span className={value ? 'text-foreground' : 'text-muted-foreground'}>{displayValue}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-sm bg-card rounded-t-3xl border-t border-border pb-safe"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <span className="font-semibold text-foreground">Set time</span>
                <button onClick={() => setOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted">
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-stretch justify-center gap-2 px-6 py-4">
                {/* Hours */}
                <ScrollColumn
                  items={HOURS}
                  selected={selH}
                  onSelect={(v) => { setSelH(v); commit(v, selM, selP); }}
                  label="HH"
                />
                <div className="flex items-center text-2xl font-bold text-foreground pb-1">:</div>
                {/* Minutes */}
                <ScrollColumn
                  items={MINUTES}
                  selected={selM}
                  onSelect={(v) => { setSelM(v); commit(selH, v, selP); }}
                  label="MM"
                />
                {/* AM/PM */}
                <div className="flex flex-col items-center gap-2 justify-center ml-2">
                  {PERIODS.map(period => (
                    <button
                      key={period}
                      type="button"
                      onClick={() => { setSelP(period); commit(selH, selM, period); }}
                      className={`w-14 py-3 rounded-xl text-sm font-semibold transition-all select-none ${
                        selP === period
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div className="px-6 pb-6">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-sm select-none"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function ScrollColumn({ items, selected, onSelect, label }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
      <div className="h-48 overflow-y-auto scrollbar-hide flex flex-col items-center gap-1 snap-y snap-mandatory">
        {items.map(item => (
          <button
            key={item}
            type="button"
            onClick={() => onSelect(item)}
            className={`w-14 py-2.5 rounded-xl text-base font-mono font-semibold transition-all snap-center select-none shrink-0 ${
              selected === item
                ? 'bg-primary text-primary-foreground scale-105'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}