import { useState } from 'react'

function App() {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState('audio') // 'audio' or 'video'
  const [fetchSubtitles, setFetchSubtitles] = useState(false)
  const [status, setStatus] = useState('idle') // idle, loading, success, error
  const [mediaUrl, setMediaUrl] = useState(null)
  const [subtitles, setSubtitles] = useState(null)

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!input) return

    setStatus('loading')
    setMediaUrl(null)
    setSubtitles(null)

    try {
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const apiUrl = isLocal 
        ? 'http://localhost:5000/api/generate'
        : 'https://easydown.onrender.com/api/generate';
      
      console.log("Appel API vers:", apiUrl);

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, mode, fetchSubtitles })
      })

      const data = await res.json()

      if (res.ok && data.status === 'success') {
        setStatus('success')
        setMediaUrl(data.mediaUrl)
        setSubtitles(data.subtitles)
      } else {
        console.error("Erreur détaillée du serveur:", data);
        setStatus('error')
      }
    } catch (err) {
      console.error("Erreur de connexion:", err);
      setStatus('error')
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-indigo-500 tracking-tight">
          CLAUDE Media HD
        </h1>
        <p className="mt-4 text-slate-300 text-lg md:text-xl max-w-2xl mx-auto">
          Téléchargez la vidéo ou la musique de vos liens, avec option sous-titres !
        </p>
      </header>

      {/* Main Form Panel */}
      <main className="w-full max-w-3xl glass-panel p-8 md:p-10 z-10">
        <form onSubmit={handleGenerate} className="flex flex-col gap-6">
          {/* Options Row */}
          <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <div className="flex gap-2 p-1 bg-black/40 rounded-lg">
              <button
                type="button"
                onClick={() => setMode('audio')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${mode === 'audio' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                🎵 Audio Seulement
              </button>
              <button
                type="button"
                onClick={() => setMode('video')}
                className={`px-4 py-2 rounded-md font-medium transition-all ${mode === 'video' ? 'bg-indigo-500 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                🎬 Vidéo Complète
              </button>
            </div>

            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative flex items-center justify-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={fetchSubtitles}
                  onChange={(e) => setFetchSubtitles(e.target.checked)}
                />
                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </div>
              <span className="text-slate-300 font-medium group-hover:text-white transition-colors">📄 Extraire Sous-titres</span>
            </label>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              className="glass-input flex-grow"
              placeholder="Ex: Lien YouTube de la vidéo..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={status === 'loading'}
            />
            <button
              type="submit"
              className="btn-primary whitespace-nowrap flex items-center justify-center min-w-[180px]"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/polygons/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Récupération...
                </span>
              ) : `Télécharger ${mode === 'audio' ? 'l\'Audio' : 'la Vidéo'}`}
            </button>
          </div>
        </form>

        {/* Loading State Context */}
        {status === 'loading' && (
          <div className="mt-8 text-center animate-pulse">
            <p className="text-sky-300 font-medium">Téléchargement en cours...</p>
            <p className="text-slate-400 text-sm mt-2">Extraction de la meilleure qualité possible...<br /><br />(Veuillez patienter quelques secondes)</p>
          </div>
        )}

        {/* Error State */}
        {status === 'error' && (
          <div className="mt-8 text-center p-4 bg-red-900/30 border border-red-500/50 rounded-xl">
            <p className="text-red-400 font-medium">Erreur lors de l'extraction. Vérifiez le lien YouTube ou tentez une autre vidéo.</p>
          </div>
        )}

        {/* Result */}
        {status === 'success' && mediaUrl && (
          <div className="mt-10 animate-glow rounded-xl overflow-hidden shadow-2xl bg-slate-800/80 border border-emerald-500/30 p-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl">{mode === 'audio' ? '🎧' : '🎬'}</span>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Fichier {mode === 'audio' ? 'Audio' : 'Vidéo'} Prêt !</h3>
            <p className="text-slate-300 text-center mb-6">Le fichier HD a été extrait avec succès.</p>
            <a
              href={mediaUrl}
              download={mode === 'audio' ? "musique" : "video"}
              className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-3 mb-8"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Télécharger le fichier
            </a>

            <div className="w-full max-w-2xl bg-black/40 p-4 rounded-xl border border-white/10">
              {mode === 'audio' ? (
                <audio controls src={mediaUrl} className="w-full outline-none" />
              ) : (
                <video controls src={mediaUrl} className="w-full rounded-lg outline-none max-h-[400px]" />
              )}
            </div>

            {fetchSubtitles && subtitles && (
              <div className="mt-8 w-full max-w-2xl text-left">
                <h4 className="text-lg font-semibold text-sky-400 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Sous-titres extraits
                </h4>
                <div className="bg-slate-900/60 border border-slate-700 rounded-xl p-5 max-h-60 overflow-y-auto custom-scrollbar">
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">
                    {subtitles}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Background Decor */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-sky-600/20 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px] pointer-events-none"></div>
    </div>
  )
}

export default App

