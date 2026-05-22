import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Scan, X, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react'
import api from '../api/axios'
import LottiePlayer from './ui/LottiePlayer'
import Button from './ui/Button'

const CATEGORY_LABELS = {
  food: 'Iýmit', transport: 'Ulag', education: 'Bilim',
  internet: 'Internet', leisure: 'Dynç alyş', health: 'Saglyk', other: 'Beýleki',
}

export default function SMSScanner({ onParsed }) {
  const [open,    setOpen]    = useState(false)
  const [text,    setText]    = useState('')
  const [loading, setLoading] = useState(false)
  const [result,  setResult]  = useState(null)
  const [error,   setError]   = useState('')

  const handleScan = async () => {
    if (!text.trim()) return
    setLoading(true); setResult(null); setError('')
    try {
      const { data } = await api.post('analytics/parse-expense/', { text })
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch {
      setError('Skanirläp bolmady. Gaýtadan synanyşyň.')
    } finally {
      setLoading(false)
    }
  }

  const handleUse = () => {
    if (!result) return
    onParsed(result)
    setOpen(false); setText(''); setResult(null)
  }

  return (
    <>
      <Button variant="secondary" size="lg" className="w-full md:w-auto" onClick={() => setOpen(true)}>
        <Scan size={18} /> SMS / Kwitansiýa
      </Button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[150]" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-[151] bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-6 max-w-lg mx-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-zinc-950 dark:bg-white flex items-center justify-center">
                    <Sparkles size={18} className="text-blue-400 dark:text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-zinc-900 dark:text-white text-lg tracking-tight">AI Skaner</h3>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">SMS ýa-da kwitansiýa</p>
                  </div>
                </div>
                <button onClick={() => { setOpen(false); setText(''); setResult(null); setError('') }}
                  className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">
                  <X size={20} className="text-zinc-500" />
                </button>
              </div>

              {!result ? (
                <div className="space-y-4">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder={`Bank SMS-iňizi ýa-da kwitansiýa tekstini goýuň...\n\nMysal: "Sberbank: Spisanie 250.00 TMT. Merchant: Bereket market. 22.05.2026"`}
                    rows={6}
                    className="w-full input-zinc resize-none text-sm leading-relaxed"
                    autoFocus
                  />
                  {error && (
                    <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-xs font-bold bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 rounded-xl px-4 py-3">
                      <AlertCircle size={14} /> {error}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button onClick={handleScan} loading={loading} disabled={!text.trim()} className="flex-1">
                      {loading ? 'Skanirlenýär...' : <><Sparkles size={16} /> Skanirle</>}
                    </Button>
                    <Button variant="secondary" onClick={() => { setOpen(false); setText('') }} className="flex-1">Ýatyr</Button>
                  </div>
                  {loading && (
                    <div className="flex flex-col items-center py-4">
                      <LottiePlayer type="loading" size={32} />
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 font-bold mt-2 uppercase tracking-widest">AI skanirleýär...</p>
                    </div>
                  )}
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm font-black mb-4">
                    <CheckCircle2 size={18} strokeWidth={2.5} /> Tapyldy! Maglumatlary barlaň
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800 rounded-2xl p-5 space-y-3">
                    {[
                      { label: 'Atlandyryş', value: result.title },
                      { label: 'Möçber', value: `${Number(result.amount).toLocaleString()} TMT` },
                      { label: 'Kategoriýa', value: CATEGORY_LABELS[result.category] || result.category },
                      { label: 'Sene', value: result.date },
                      result.notes && { label: 'Bellik', value: result.notes },
                    ].filter(Boolean).map((row) => (
                      <div key={row.label} className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 dark:text-zinc-500">{row.label}</span>
                        <span className="font-bold text-zinc-900 dark:text-white text-sm">{row.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleUse} className="flex-1 bg-emerald-600 hover:bg-emerald-500">
                      <CheckCircle2 size={16} /> Forma geçir
                    </Button>
                    <Button variant="secondary" onClick={() => setResult(null)} className="flex-1">Täzele</Button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
