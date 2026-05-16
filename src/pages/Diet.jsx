import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';
import { Plus, Trash2, Utensils, Droplets, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
const DRINK_TYPES = ['water', 'coffee', 'tea', 'juice', 'smoothie', 'soda', 'protein shake', 'other'];
const DRINK_EMOJIS = { water: '💧', coffee: '☕', tea: '🍵', juice: '🧃', smoothie: '🥤', soda: '🥤', 'protein shake': '💪', other: '🫗' };

const MEAL_TABS = [
  { id: 'food', label: 'Food Log', icon: Utensils },
  { id: 'drinks', label: 'Drinks Log', icon: Droplets },
];

export default function Diet() {
  const today = format(new Date(), 'yyyy-MM-dd');
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('food');
  const [showFoodForm, setShowFoodForm] = useState(false);
  const [showDrinkForm, setShowDrinkForm] = useState(false);
  const [foodForm, setFoodForm] = useState({ name: '', calories: '', meal_type: 'breakfast' });
  const [drinkForm, setDrinkForm] = useState({ name: 'water', drink_type: 'water', amount_ml: '', calories: '' });

  const { data: logs } = useQuery({
    queryKey: ['dailylog', today],
    queryFn: () => base44.entities.DailyLog.filter({ date: today }),
    initialData: [],
  });

  const log = logs?.[0] || null;

  const save = useMutation({
    mutationFn: async (data) => {
      if (log?.id) return base44.entities.DailyLog.update(log.id, data);
      return base44.entities.DailyLog.create({ ...data, date: today });
    },
    onSuccess: (saved) => {
      qc.setQueryData(['dailylog', today], [saved]);
    },
  });

  const updateLog = (patch) => {
    const current = log || { date: today, food_entries: [], drink_entries: [], water_glasses: 0 };
    save.mutate({ ...current, ...patch });
  };

  const addFood = () => {
    if (!foodForm.name.trim()) return;
    const entry = {
      name: foodForm.name,
      calories: Number(foodForm.calories) || 0,
      meal_type: foodForm.meal_type,
      time: format(new Date(), 'HH:mm'),
    };
    updateLog({ food_entries: [...(log?.food_entries || []), entry] });
    setFoodForm({ name: '', calories: '', meal_type: foodForm.meal_type });
    setShowFoodForm(false);
  };

  const removeFood = (idx) => {
    updateLog({ food_entries: (log?.food_entries || []).filter((_, i) => i !== idx) });
  };

  const addDrink = () => {
    if (!drinkForm.name.trim()) return;
    const entry = {
      name: drinkForm.name,
      drink_type: drinkForm.drink_type,
      amount_ml: Number(drinkForm.amount_ml) || 250,
      calories: Number(drinkForm.calories) || 0,
      time: format(new Date(), 'HH:mm'),
    };
    const newDrinks = [...(log?.drink_entries || []), entry];
    const waterGlasses = newDrinks.filter(e => e.drink_type === 'water').length;
    updateLog({ drink_entries: newDrinks, water_glasses: waterGlasses });
    setDrinkForm({ name: 'water', drink_type: 'water', amount_ml: '', calories: '' });
    setShowDrinkForm(false);
  };

  const removeDrink = (idx) => {
    const newDrinks = (log?.drink_entries || []).filter((_, i) => i !== idx);
    const waterGlasses = newDrinks.filter(e => e.drink_type === 'water').length;
    updateLog({ drink_entries: newDrinks, water_glasses: waterGlasses });
  };

  const foodEntries = log?.food_entries || [];
  const drinkEntries = log?.drink_entries || [];
  const foodCals = foodEntries.reduce((s, f) => s + (f.calories || 0), 0);
  const drinkCals = drinkEntries.reduce((s, d) => s + (d.calories || 0), 0);
  const totalCals = foodCals + drinkCals;
  const totalMl = drinkEntries.reduce((s, d) => s + (d.amount_ml || 0), 0);

  const groupedFood = MEAL_TYPES.map(type => ({
    type,
    items: foodEntries.filter(f => f.meal_type === type),
  })).filter(g => g.items.length > 0);

  return (
    <div>
      <div className="mb-6">
        <div className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{format(new Date(), 'EEEE, MMM d')}</div>
        <h1 className="font-display text-3xl text-foreground">Food &amp; Drinks 🥗</h1>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
          <span className="text-2xl">🔥</span>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Calories today</div>
            <div className="font-display text-2xl text-primary">{totalCals}</div>
            {drinkCals > 0 && <div className="text-[10px] text-muted-foreground">incl. {drinkCals} from drinks</div>}
          </div>
        </div>
        <div className="rounded-2xl bg-card border border-border p-4 flex items-center gap-3">
          <span className="text-2xl">💧</span>
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Fluids today</div>
            <div className="font-display text-2xl text-secondary">{totalMl >= 1000 ? `${(totalMl/1000).toFixed(1)}L` : `${totalMl}ml`}</div>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-muted/40 rounded-2xl p-1.5 mb-6">
        {MEAL_TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn('flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                activeTab === t.id ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground')}>
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* FOOD LOG */}
      {activeTab === 'food' && (
        <div className="space-y-4">
          <button onClick={() => setShowFoodForm(!showFoodForm)}
            className="w-full flex items-center gap-3 bg-card rounded-2xl border border-dashed border-primary/40 px-5 py-4 text-muted-foreground hover:border-primary hover:text-primary transition-all text-sm">
            <Plus className="w-4 h-4" /> Log something you ate...
          </button>

          <AnimatePresence>
            {showFoodForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-card rounded-2xl border border-border p-5 space-y-3">
                <input
                  placeholder="What did you eat?"
                  value={foodForm.name}
                  onChange={e => setFoodForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-primary"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number" placeholder="Calories (optional)"
                    value={foodForm.calories}
                    onChange={e => setFoodForm(f => ({ ...f, calories: e.target.value }))}
                    className="bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-primary"
                  />
                  <div className="relative">
                    <select value={foodForm.meal_type} onChange={e => setFoodForm(f => ({ ...f, meal_type: e.target.value }))}
                      className="w-full appearance-none bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground border border-border focus:outline-none focus:border-primary">
                      {MEAL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={addFood} className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
                    Log it ✓
                  </button>
                  <button onClick={() => setShowFoodForm(false)} className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {foodEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <div className="text-4xl mb-3">🥗</div>
              Nothing logged yet today — tap above to add your first meal!
            </div>
          ) : (
            <div className="space-y-4">
              {groupedFood.map(group => (
                <div key={group.type}>
                  <div className="text-xs text-muted-foreground uppercase tracking-widest mb-2 px-1 capitalize">{group.type}</div>
                  <div className="space-y-2">
                    {group.items.map((item, i) => {
                      const globalIdx = foodEntries.indexOf(item);
                      return (
                        <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-3 bg-card rounded-xl border border-border px-4 py-3">
                          <span className="text-lg">🍽️</span>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{item.name}</div>
                            <div className="text-xs text-muted-foreground">{item.calories ? `${item.calories} kcal` : 'no calories logged'} · {item.time}</div>
                          </div>
                          <button onClick={() => removeFood(globalIdx)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DRINKS LOG */}
      {activeTab === 'drinks' && (
        <div className="space-y-4">
          <button onClick={() => setShowDrinkForm(!showDrinkForm)}
            className="w-full flex items-center gap-3 bg-card rounded-2xl border border-dashed border-secondary/40 px-5 py-4 text-muted-foreground hover:border-secondary hover:text-secondary transition-all text-sm">
            <Plus className="w-4 h-4" /> Log a drink...
          </button>

          <AnimatePresence>
            {showDrinkForm && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="bg-card rounded-2xl border border-border p-5 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {DRINK_TYPES.map(dt => (
                    <button key={dt} onClick={() => setDrinkForm(f => ({ ...f, drink_type: dt, name: dt }))}
                      className={cn('flex items-center gap-2 px-3 py-2 rounded-xl text-sm border transition-all',
                        drinkForm.drink_type === dt ? 'bg-secondary/20 border-secondary text-secondary' : 'border-border text-muted-foreground hover:border-secondary/50')}>
                      <span>{DRINK_EMOJIS[dt] || '🫗'}</span> {dt}
                    </button>
                  ))}
                </div>
                <input
                  placeholder="Custom name (optional)"
                  value={drinkForm.name === drinkForm.drink_type ? '' : drinkForm.name}
                  onChange={e => setDrinkForm(f => ({ ...f, name: e.target.value || f.drink_type }))}
                  className="w-full bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-secondary"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number" placeholder="Amount in ml (default 250)"
                    value={drinkForm.amount_ml}
                    onChange={e => setDrinkForm(f => ({ ...f, amount_ml: e.target.value }))}
                    className="bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-secondary"
                  />
                  <input
                    type="number" placeholder="Calories (optional)"
                    value={drinkForm.calories}
                    onChange={e => setDrinkForm(f => ({ ...f, calories: e.target.value }))}
                    className="bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:border-secondary"
                  />
                </div>
                <div className="flex gap-2">
                  <button onClick={addDrink} className="flex-1 bg-secondary text-secondary-foreground py-2.5 rounded-xl text-sm font-medium hover:bg-secondary/90 transition-colors">
                    Log it 💧
                  </button>
                  <button onClick={() => setShowDrinkForm(false)} className="px-4 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-muted transition-colors">
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {drinkEntries.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <div className="text-4xl mb-3">💧</div>
              Stay hydrated! Log your first drink above.
            </div>
          ) : (
            <div className="space-y-2">
              {drinkEntries.map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 bg-card rounded-xl border border-border px-4 py-3">
                  <span className="text-lg">{DRINK_EMOJIS[item.drink_type] || '🫗'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground capitalize">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.amount_ml}ml{item.calories ? ` · ${item.calories} kcal` : ''} · {item.time}</div>
                  </div>
                  <button onClick={() => removeDrink(i)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
              <div className="text-center text-xs text-muted-foreground pt-2">
                Total: {totalMl >= 1000 ? `${(totalMl/1000).toFixed(1)}L` : `${totalMl}ml`} today 💧
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}