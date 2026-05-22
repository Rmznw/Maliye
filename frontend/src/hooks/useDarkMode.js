import { useEffect, useState } from 'react'

const KEY = 'theme'

function getInitial() {
  const stored = localStorage.getItem(KEY)
  if (stored) return stored === 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export default function useDarkMode() {
  const [dark, setDark] = useState(getInitial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem(KEY, dark ? 'dark' : 'light')
  }, [dark])

  return [dark, setDark]
}
