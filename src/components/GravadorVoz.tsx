import { useEffect, useRef, useState } from 'react'
import { IconMicrofone, IconParar } from './icons'

interface Props {
  /** Recorded audio as a data: URL (persisted on the task). */
  value: string
  onChange: (dataUrl: string) => void
}

function formatarTempo(segundos: number): string {
  const m = Math.floor(segundos / 60)
  const s = segundos % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// localStorage holds all app data together; keep recordings well under the
// typical ~5MB quota so saving the recording doesn't drop the rest of the data.
const LIMITE_BYTES = 4_500_000

/**
 * In-browser voice recorder using the computer microphone (MediaRecorder).
 * Records the meeting audio, lets the user play it back, download it, and
 * stores a short recording on the task. Long recordings should be downloaded
 * and linked via the "Link da gravação" field instead.
 */
export default function GravadorVoz({ value, onChange }: Props) {
  const [gravando, setGravando] = useState(false)
  const [tempo, setTempo] = useState(0)
  const [aviso, setAviso] = useState('')
  const [erro, setErro] = useState('')

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<number | null>(null)

  const suportado =
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'

  // Stop the timer and release the microphone if the component unmounts mid-recording.
  useEffect(
    () => () => {
      if (timerRef.current) clearInterval(timerRef.current)
      recorderRef.current?.stream?.getTracks().forEach((t) => t.stop())
    },
    [],
  )

  function pararTimer() {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  async function iniciar() {
    setErro('')
    setAviso('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      chunksRef.current = []
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const leitor = new FileReader()
        leitor.onloadend = () => {
          const url = String(leitor.result)
          if (url.length > LIMITE_BYTES) {
            setAviso(
              'Gravação longa: pode não ser salva no navegador. Baixe o áudio e cole o link no campo "Link da gravação".',
            )
          }
          onChange(url)
        }
        leitor.readAsDataURL(blob)
      }
      recorder.start()
      recorderRef.current = recorder
      setGravando(true)
      setTempo(0)
      timerRef.current = window.setInterval(() => setTempo((t) => t + 1), 1000)
    } catch {
      setErro(
        'Não foi possível acessar o microfone. Verifique a permissão do navegador (ou o link pode não permitir microfone).',
      )
    }
  }

  function parar() {
    recorderRef.current?.stop()
    setGravando(false)
    pararTimer()
  }

  function remover() {
    if (confirm('Remover a gravação de áudio desta reunião?')) onChange('')
  }

  if (!suportado) {
    return (
      <p className="text-xs text-slate-500">
        Este navegador não permite gravar áudio. Use o campo “Link da gravação”.
      </p>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        {!gravando ? (
          <button type="button" className="btn-secondary" onClick={iniciar}>
            <IconMicrofone width={16} height={16} />
            {value ? 'Regravar áudio' : 'Gravar áudio'}
          </button>
        ) : (
          <button
            type="button"
            className="btn bg-rose-600 text-white hover:bg-rose-700"
            onClick={parar}
          >
            <IconParar width={16} height={16} />
            Parar
          </button>
        )}

        {gravando && (
          <span className="inline-flex items-center gap-1.5 text-sm font-medium text-rose-600">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-600" />
            Gravando… {formatarTempo(tempo)}
          </span>
        )}

        {value && !gravando && (
          <>
            <a
              href={value}
              download="gravacao-reuniao.webm"
              className="text-xs font-medium text-brand-600 hover:underline"
            >
              Baixar áudio
            </a>
            <button
              type="button"
              onClick={remover}
              className="text-xs font-medium text-slate-400 hover:text-rose-600"
            >
              Remover
            </button>
          </>
        )}
      </div>

      {value && !gravando && (
        <audio controls src={value} className="w-full">
          Seu navegador não suporta áudio.
        </audio>
      )}

      {aviso && <p className="text-xs text-amber-600">{aviso}</p>}
      {erro && <p className="text-xs text-rose-600">{erro}</p>}
    </div>
  )
}
