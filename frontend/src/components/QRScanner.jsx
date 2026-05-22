import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, X, Camera, CheckCircle2, AlertCircle, Flashlight } from 'lucide-react'
import { Html5Qrcode } from 'html5-qrcode'
import api from '../api/axios'
import LottiePlayer from './ui/LottiePlayer'
import Button from './ui/Button'

const CATEGORY_LABELS = {
  food: 'Iýmit', transport: 'Ulag', education: 'Bilim',
  internet: 'Internet', leisure: 'Dynç alyş', health: 'Saglyk', other: 'Beýleki',
}

export default function QRScanner({ onParsed }) {
  const [open,      setOpen]      = useState(false)
  const [scanning,  setScanning]  = useState(false)
  const [parsing,   setParsing]   = useState(false)
  const [result,    setResult]    = useState(null)
  const [error,     setError]     = useState('')
  const [cameras,   setCameras]   = useState([])
  const [camIdx,    setCamIdx]    = useState(0)
  const scannerRef  = useRef(null)
  const qrId        = 'qr-reader-el'

  const stopScanner = async () => {
    if (scannerRef.current) {
      try { await scannerRef.current.stop() } catch {}
      try { scannerRef.current.clear() } catch {}
      scannerRef.current = null
    }
    setScanning(false)
  }

  const startScanner = async (cameraId) => {
    setError('')
    setScanning(true)
    try {
      const scanner = new Html5Qrcode(qrId)
      scannerRef.current = scanner
      await scanner.start(
        cameraId || { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
        async (decodedText) => {
          await stopScanner()
          parseText(decodedText)
        },
        () => {}
      )
    } catch (e) {
      setError('Kamera açylmady. Brauzer rugsat bermeli.')
      setScanning(false)
    }
  }

  const parseText = async (text) => {
    setParsing(true)
    setError('')
    try {
      const { data } = await api.post('analytics/parse-expense/', { text })
      if (data.error) { setError(data.error); return }
      setResult(data)
    } catch {
      setError('Maglumat çykarylyp bilinmedi.')
    } finally {
      setParsing(false)
    }
  }

  const handleOpen = async () => {
    setOpen(true)
    setResult(null)
    setError('')
    // Get available cameras
    try {
      const devs = await Html5Qrcode.getCameras()
      setCameras(devs)
      const backCam = devs.find(d => /back|rear|environment/i.test(d.label))
      const startId = backCam ? backCam.id : devs[0]?.id
      if (startId) startScanner(startId)
      else startScanner(null)
    } catch {
      startScanner(null)
    }
  }

  const handleClose = async () => {
    await stopScanner()
    setOpen(false)
    setResult(null)
    setError('')
  }

  const switchCamera = async () => {
    await stopScanner()
    const next = (camIdx + 1) % cameras.length
    setCamIdx(next)
    startScanner(cameras[next]?.id)
  }

  const handleUse = () => {
    if (!result) return
    onParsed(result)
    handleClose()
  }

  const handleRetry = async () => {
    setResult(null)
    setError('')
    const id = cameras[camIdx]?.id
    startScanner(id || null)
  }

  return (
    <>
      <Button variant="secondary" size="lg" className="w-full md:w-auto" onClick={handleOpen}>
        <QrCode size={18} /> QR Skaner
      </Button>

      {open && createPortal(
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] bg-black flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-12 pb-4 flex-shrink-0">
            <div>
              <h2 className="font-black text-white text-xl tracking-tight">QR / Ştrix kod</h2>
              <p className="text-zinc-400 text-xs font-medium mt-0.5">
                Kwitansiýa ýa-da töleg koduna kamerany tutduryň
              </p>
            </div>
            <button onClick={handleClose}
              className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
              <X size={20} className="text-white" />
            </button>
          </div>

          {/* Camera viewfinder */}
          {!result && !parsing && (
            <div className="flex-1 flex flex-col items-center justify-center px-5 gap-4 min-h-0">
              {/* QR reader element */}
              <div className="relative w-full max-w-xs">
                <div id={qrId} className="w-full rounded-3xl overflow-hidden" />

                {/* Overlay frame */}
                {scanning && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="relative w-56 h-56">
                      {/* Corner brackets */}
                      {[
                        'top-0 left-0 border-t-4 border-l-4 rounded-tl-xl',
                        'top-0 right-0 border-t-4 border-r-4 rounded-tr-xl',
                        'bottom-0 left-0 border-b-4 border-l-4 rounded-bl-xl',
                        'bottom-0 right-0 border-b-4 border-r-4 rounded-br-xl',
                      ].map((cls, i) => (
                        <div key={i} className={`absolute w-10 h-10 border-blue-500 ${cls}`} />
                      ))}
                      {/* Scan line */}
                      <motion.div
                        className="absolute left-2 right-2 h-0.5 bg-blue-500 shadow-[0_0_8px_2px_rgba(59,130,246,0.8)]"
                        animate={{ top: ['10%', '90%', '10%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    </div>
                  </div>
                )}

                {!scanning && !error && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 rounded-3xl gap-3">
                    <Camera size={48} className="text-zinc-600" />
                    <p className="text-zinc-500 text-sm font-medium">Kamera başlanýar...</p>
                  </div>
                )}
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-xs bg-red-900/30 border border-red-800 rounded-2xl px-4 py-4 flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-300 text-sm font-semibold">{error}</p>
                    <button onClick={handleRetry} className="text-red-400 text-xs mt-1 underline">
                      Gaýtadan synanyş
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Switch camera */}
              {cameras.length > 1 && (
                <button onClick={switchCamera}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/10 rounded-2xl text-white text-sm font-semibold">
                  <Camera size={16} /> Kamera çalyş
                </button>
              )}

              <p className="text-zinc-600 text-xs text-center max-w-xs">
                QR kody, ştrix kody ýa-da bank SMS tekstini skanirläp bilersiňiz
              </p>
            </div>
          )}

          {/* Parsing state */}
          {parsing && (
            <div className="flex-1 flex flex-col items-center justify-center gap-5">
              <LottiePlayer type="loading" size={48} color="#60a5fa" />
              <p className="text-zinc-300 text-sm font-semibold">AI analizleýär...</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col px-5 pt-4 pb-8 gap-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 size={20} className="text-emerald-400" />
                </div>
                <div>
                  <p className="font-black text-white">Tapyldy!</p>
                  <p className="text-zinc-400 text-xs">Maglumatlary barlaň</p>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 flex-1">
                {[
                  { label: 'Atlandyryş', value: result.title },
                  { label: 'Möçber',     value: `${Number(result.amount).toLocaleString()} TMT` },
                  { label: 'Kategoriýa', value: CATEGORY_LABELS[result.category] || result.category },
                  { label: 'Sene',       value: result.date },
                  result.notes && { label: 'Bellik', value: result.notes },
                ].filter(Boolean).map(row => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-zinc-500 text-xs font-semibold uppercase tracking-wider">{row.label}</span>
                    <span className="text-white font-bold text-sm">{row.value}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 flex-shrink-0">
                <button onClick={handleRetry}
                  className="flex-1 py-4 rounded-2xl bg-white/10 text-white font-bold text-sm">
                  Täzeden
                </button>
                <button onClick={handleUse}
                  className="flex-1 py-4 rounded-2xl bg-blue-600 text-white font-black text-sm">
                  Forma geçir
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>,
        document.body
      )}
    </>
  )
}
