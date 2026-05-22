import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Check, User, Mail, Wallet, Shield, ArrowRight } from 'lucide-react'
import clsx from 'clsx'
import api from '../api/axios'
import useAuthStore from '../store/authStore'
import PageWrapper from '../components/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import LottiePlayer from '../components/ui/LottiePlayer'
import { useToast } from '../context/ToastContext'

export default function Profile() {
  const { user, fetchMe } = useAuthStore()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', currency: 'TMT', monthly_budget: '' })
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (user) setForm({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      currency: user.currency || 'TMT',
      monthly_budget: user.monthly_budget || '',
    })
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await api.patch('auth/me/', form)
      await fetchMe()
      setSaved(true)
      toast.success('Profil üýtgedildi!')
      setTimeout(() => setSaved(false), 2500)
    } catch {
      toast.error('Ýalňyşlyk ýüze çykdy.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageWrapper>
      <div className="space-y-6 md:space-y-14 max-w-5xl mx-auto">
        <div className="space-y-2">
          <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400 dark:text-zinc-500">Şahsy bölümi</h2>
          <h1 className="text-4xl md:text-6xl font-black text-zinc-900 dark:text-white tracking-tighter leading-none">Profil</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          <Card className="lg:col-span-4 flex flex-col items-center text-center !p-12 h-fit">
            <motion.div
              className="w-28 h-28 rounded-[2.5rem] bg-zinc-900 dark:bg-white flex items-center justify-center text-white dark:text-zinc-900 text-4xl font-black shadow-[0_20px_50px_rgba(0,0,0,0.15)] mb-8"
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              {user?.username?.[0]?.toUpperCase()}
            </motion.div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{user?.username}</h2>
            <p className="text-zinc-400 dark:text-zinc-500 text-sm font-bold mt-2 uppercase tracking-widest">{user?.email || 'E-poçta ýok'}</p>

            {user?.monthly_budget && (
              <div className="mt-8 w-full">
                <LottiePlayer type="finance" size={120} className="mx-auto" />
                <p className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mt-2 text-center">
                  Aýlyk býujet: <span className="text-zinc-900 dark:text-white">{Number(user.monthly_budget).toLocaleString()} TMT</span>
                </p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-zinc-50 dark:border-zinc-800 w-full space-y-4">
              <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                <span>Agza wagty</span>
                <span className="text-zinc-900 dark:text-white">{user?.date_joined ? new Date(user.date_joined).toLocaleDateString('tk-TM') : '—'}</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                <span>Status</span>
                <span className="text-emerald-600">Işjeň</span>
              </div>
            </div>
          </Card>

          <Card className="lg:col-span-8 !p-8 md:!p-16 bg-zinc-50/20 dark:bg-zinc-800/20 border-zinc-100/50 dark:border-zinc-800/50">
            <h3 className="text-2xl font-bold text-zinc-900 dark:text-white mb-12 tracking-tight">Maglumatlary üýtget</h3>
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Ady</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                    <input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                      placeholder="Adyňyz" className="input-zinc pl-12 font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Familiýasy</label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                    <input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                      placeholder="Familiýaňyz" className="input-zinc pl-12 font-bold" />
                  </div>
                </div>
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">E-poçta salgysy</label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="email@mysal.com" className="input-zinc pl-12 font-bold" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Pul birligi</label>
                  <div className="relative">
                    <Wallet size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                    <select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className="input-zinc pl-12 font-bold appearance-none">
                      <option value="TMT">TMT — Manat</option>
                      <option value="USD">USD — Dollar</option>
                      <option value="EUR">EUR — Ýewro</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-[0.2em] ml-1">Aýlyk çäk (Býujet)</label>
                  <div className="relative">
                    <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
                    <input type="number" step="0.01" min="0" placeholder="0.00" value={form.monthly_budget}
                      onChange={(e) => setForm({ ...form, monthly_budget: e.target.value })} className="input-zinc pl-12 font-black text-lg" />
                  </div>
                </div>
              </div>
              <div className="pt-10 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                <Button type="submit" loading={loading} className={clsx('w-full md:w-auto py-5 px-12 text-lg', saved ? 'bg-emerald-600 hover:bg-emerald-700' : '')}>
                  {saved ? <><Check size={20} strokeWidth={3} className="mr-2" /> Saklandy!</> : <>Ýatda sakla <ArrowRight size={18} className="ml-2" /></>}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </PageWrapper>
  )
}
