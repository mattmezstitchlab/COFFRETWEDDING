import { useCallback, useEffect, useRef, useState } from 'react'
import type { MagazineData } from './types'
import { createMagazine, validateMagazine } from './engine'
import { persistMagazine, readMagazine } from './persistence'

export function useMagazine() {
  const [data, setData] = useState<MagazineData | null>(null)
  const [saveState, setSaveState] = useState<'loading' | 'saving' | 'saved' | 'error'>('loading')
  const [error, setError] = useState('')
  const dataRef = useRef<MagazineData | null>(null)
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        let saved: MagazineData | undefined
        try { saved = await readMagazine() } catch { /* The editor remains usable when browser storage is restricted. */ }
        if (!saved || !validateMagazine(saved)) {
          const response = await fetch('/data/legacy-seed.json')
          if (!response.ok) throw new Error('La source éditoriale n’a pas pu être chargée.')
          saved = createMagazine(await response.json())
        }
        if (!cancelled) { setData(saved); dataRef.current = saved }
      } catch (err) { if (!cancelled) setError(err instanceof Error ? err.message : 'Impossible de charger le magazine.') }
    }
    void load()
    return () => { cancelled = true }
  }, [])
  useEffect(() => {
    if (!data) return
    dataRef.current = data
    setSaveState('saving')
    const timeout = window.setTimeout(() => {
      persistMagazine(data).then(() => setSaveState('saved')).catch(() => setSaveState('error'))
    }, 300)
    return () => window.clearTimeout(timeout)
  }, [data])
  const update = useCallback((transform: (data: MagazineData) => MagazineData) => {
    setData(current => current ? { ...transform(current), updatedAt: new Date().toISOString() } : current)
  }, [])
  const saveNow = useCallback(async () => {
    if (!dataRef.current) return
    setSaveState('saving')
    try { await persistMagazine(dataRef.current); setSaveState('saved'); return true } catch { setSaveState('error'); return false }
  }, [])
  return { data, setData, update, saveState, saveNow, error }
}
