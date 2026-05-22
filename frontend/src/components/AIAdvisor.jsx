import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Bot, ChevronDown, ShoppingCart } from 'lucide-react'
import api from '../api/axios'
import LottiePlayer from './ui/LottiePlayer'

const QUICK = [
  'Bu ay nädip tygşytlaýyn?',
  'Iň köp näme üçin çykdajy edýärin?',
  'Býujetimi nädip meýilleşdirýärin?',
]

export default function AIAdvisor() {
  const [open,        setOpen]        = useState(false)
  const [buyMode,     setBuyMode]     = useState(false)
  const [messages,    setMessages]    = useState([
    { role: 'ai', text: 'Salam! Men siziň AI maliýe geňeşçiňiz. Islendik soragy beriň.' },
  ])
  const [input,       setInput]       = useState('')
  const [buyItem,     setBuyItem]     = useState('')
  const [buyPrice,    setBuyPrice]    = useState('')
  const [loading,     setLoading]     = useState(false)
  const bottomRef   = useRef(null)
  const inputRef    = useRef(null)
  const buyInputRef = useRef(null)

  useEffect(() => {
    if (open) setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 150)
  }, [open, messages])

  useEffect(() => {
    if (open && !buyMode) setTimeout(() => inputRef.current?.focus(), 350)
    if (open && buyMode)  setTimeout(() => buyInputRef.current?.focus(), 100)
  }, [open, buyMode])

  const send = async (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    setMessages(m => [...m, { role: 'user', text: q }])
    setLoading(true)
    try {
      const { data } = await api.post('analytics/ai-advice/', { message: q })
      setMessages(m => [...m, { role: 'ai', text: data.reply }])
    } catch {
      setMessages(m => [...m, { role: 'ai', text: 'Häzir jogap berip bilemok. Biraz soň synanyşyň.' }])
    } finally {
      setLoading(false)
    }
  }

  const sendBuy = () => {
    if (!buyItem.trim()) return
    const msg = buyPrice
      ? `"${buyItem}" satyn almakçy. Bahasy ${buyPrice} TMT. Meniň maliýe ýagdaýyma görä satyn alyp bilerminmi?`
      : `"${buyItem}" satyn almaly. Häzirki ýagdaýymda bu akyllymy?`
    setBuyMode(false); setBuyItem(''); setBuyPrice('')
    send(msg)
  }

  return (
    <>
      {/* Trigger */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
            onClick={() => setOpen(true)}
            className="fixed bottom-24 right-4 z-[101] w-13 h-13 min-w-[3.25rem] min-h-[3.25rem] bg-blue-600 text-white rounded-2xl shadow-2xl shadow-blue-600/40 flex items-center justify-center"
            whileTap={{ scale: 0.9 }}
          >
            <Sparkles size={20} strokeWidth={2.5} />
            <motion.span
              className="absolute inset-0 rounded-2xl border-2 border-blue-400"
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[101]" onClick={() => setOpen(false)} />

            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 40 }}
              className="fixed z-[102] bg-white dark:bg-zinc-900 flex flex-col inset-x-0 bottom-0 rounded-t-3xl md:inset-auto md:bottom-6 md:right-6 md:w-96 md:rounded-3xl md:shadow-2xl"
              style={{ height: 'min(85dvh, 640px)' }}
            >
              {/* Handle (mobile) */}
              <div className="md:hidden flex justify-center pt-2.5 pb-1 flex-shrink-0">
                <div className="w-9 h-1 rounded-full bg-zinc-200 dark:bg-zinc-700" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 text-white flex-shrink-0 rounded-t-3xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
                    <Bot size={17} />
                  </div>
                  <div>
                    <p className="font-black text-sm">AI Geňeşçi</p>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">Gemini 2.5</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Buy checker toggle */}
                  <button
                    onClick={() => setBuyMode(!buyMode)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      buyMode ? 'bg-blue-600 text-white' : 'bg-white/10 text-zinc-300 hover:bg-white/20'
                    }`}
                  >
                    <ShoppingCart size={13} /> Satyn al?
                  </button>
                  <button onClick={() => setOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                    <ChevronDown size={18} />
                  </button>
                </div>
              </div>

              {/* Buy mode panel */}
              <AnimatePresence>
                {buyMode && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden flex-shrink-0 border-b border-zinc-100 dark:border-zinc-800"
                  >
                    <div className="p-4 space-y-2.5 bg-blue-50 dark:bg-blue-900/10">
                      <p className="text-xs font-black text-blue-700 dark:text-blue-400 uppercase tracking-widest">Satyn almaly?</p>
                      <input
                        ref={buyInputRef}
                        value={buyItem}
                        onChange={e => setBuyItem(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && sendBuy()}
                        placeholder="Näme satyn almakçy?"
                        className="w-full bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500 dark:text-white"
                      />
                      <div className="flex gap-2">
                        <input
                          type="number" value={buyPrice} onChange={e => setBuyPrice(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && sendBuy()}
                          placeholder="Bahasy (TMT, islege görä)"
                          className="flex-1 bg-white dark:bg-zinc-800 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2.5 text-sm font-medium outline-none focus:border-blue-500 dark:text-white"
                        />
                        <button
                          onClick={sendBuy} disabled={!buyItem.trim()}
                          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold disabled:opacity-40 hover:bg-blue-500 transition-colors"
                        >
                          Soramak
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {msg.role === 'ai' && (
                      <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Sparkles size={12} className="text-blue-400" />
                      </div>
                    )}
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[84%] ${
                      msg.role === 'user'
                        ? 'bg-zinc-950 text-white rounded-tr-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center flex-shrink-0">
                      <Sparkles size={12} className="text-blue-400" />
                    </div>
                    <div className="bg-zinc-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                      <LottiePlayer type="loading" size={16} color="#a1a1aa" />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Quick chips */}
              <div className="px-3 py-2 flex gap-2 overflow-x-auto flex-shrink-0 border-t border-zinc-100 dark:border-zinc-800" style={{ scrollbarWidth: 'none' }}>
                {QUICK.map(q => (
                  <button key={q} onClick={() => send(q)} disabled={loading}
                    className="flex-shrink-0 text-[10px] font-bold px-3 py-1.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 hover:text-blue-700 transition-colors text-zinc-500 dark:text-zinc-400 whitespace-nowrap disabled:opacity-40">
                    {q}
                  </button>
                ))}
              </div>

              {/* Input */}
              <div className="p-3 flex gap-2 flex-shrink-0" style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}>
                <input
                  ref={inputRef} value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Soralyňyzy ýazyň..."
                  className="flex-1 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:border-zinc-900 dark:focus:border-zinc-400 dark:text-white transition-all"
                />
                <motion.button onClick={() => send()} disabled={!input.trim() || loading}
                  className="w-11 h-11 bg-zinc-950 text-white rounded-2xl flex items-center justify-center disabled:opacity-30 flex-shrink-0"
                  whileTap={{ scale: 0.9 }}>
                  <Send size={15} />
                </motion.button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
