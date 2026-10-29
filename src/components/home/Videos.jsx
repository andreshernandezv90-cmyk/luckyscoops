import { useState } from 'react'
import { BRAND, contactLinks } from '../../config/brand.js'
import { VIDEOS } from '../../data/videos.js'
import { SHOW_PENDING } from '../../config/env.js'
import { PendingTag } from '../PendingTag.jsx'
import { SectionTitle } from './SectionTitle.jsx'

/**
 * Tarjeta de video vertical (9:16). Para no hacer lenta la página, el video de
 * TikTok solo se carga cuando la persona pulsa "Ver video".
 */
function VideoCard({ video }) {
  const [playing, setPlaying] = useState(false)
  const ready = Boolean(video.tiktokId || video.url)
  return (
    <li className="video-card">
      <div className="video-card__frame">
        {playing && video.tiktokId ? (
          <iframe
            className="video-card__embed"
            src={`https://www.tiktok.com/embed/v2/${video.tiktokId}`}
            title={video.title}
            allow="encrypted-media; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <div className="video-card__placeholder">
            <svg className="video-card__play" viewBox="0 0 64 64" aria-hidden="true" focusable="false">
              <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="2" />
              <path d="M26 20 L46 32 L26 44 Z" fill="currentColor" />
            </svg>
            <span className="video-card__category">{video.category}</span>
          </div>
        )}
      </div>
      <h3 className="video-card__title">{video.title}</h3>
      {video.tiktokId && !playing && (
        <button type="button" className="btn btn--ghost" onClick={() => setPlaying(true)}>
          Ver video
        </button>
      )}
      {!video.tiktokId && video.url && (
        <a className="btn btn--ghost" href={video.url} target="_blank" rel="noreferrer">
          Ver video
        </a>
      )}
      {!ready && <PendingTag>Video próximamente</PendingTag>}
    </li>
  )
}

/** "Desde el Caldero de la Bruja": TikToks, preparaciones, empaques y novedades. */
export function Videos() {
  const { tiktok } = contactLinks()
  // En la versión publicada solo se muestran los videos que ya tienen enlace.
  const videos = VIDEOS.filter((video) => SHOW_PENDING || video.tiktokId || video.url)
  return (
    <section className="section" id="videos" aria-labelledby="videos-title">
      <SectionTitle id="videos-title" kicker="Mira cómo se hace la magia">
        Desde el Caldero de la Bruja
      </SectionTitle>
      {/* Sin videos publicados todavía, la sección no se queda vacía */}
      {videos.length === 0 && (
        <p className="section__lead">Pronto compartiremos aquí preparaciones de Scoops, empaques y novedades.</p>
      )}
      {videos.length > 0 && (
        <>
          <p className="section__lead">
            Preparaciones de Scoops, empaques, nuevos productos y pedidos reales, directo desde nuestras redes.
          </p>
          <ul className="video-grid">
            {videos.map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </ul>
        </>
      )}

      {(tiktok || SHOW_PENDING) && (
        <p className="section__cta">
          {tiktok ? (
            <a className="btn btn--primary btn--lg" href={tiktok} target="_blank" rel="noreferrer">
              Síguenos en TikTok
            </a>
          ) : (
            <span className="pending-line">
              TikTok de {BRAND.name} <PendingTag />
            </span>
          )}
        </p>
      )}
    </section>
  )
}
