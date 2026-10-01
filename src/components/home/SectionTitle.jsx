import { ChapterDivider } from '../illustrations/Ornaments.jsx'

export function SectionTitle({ id, kicker, children }) {
  return (
    <header className="section-title">
      {kicker && <p className="section-title__kicker">{kicker}</p>}
      <h2 id={id} className="section-title__heading">
        {children}
      </h2>
      <ChapterDivider className="section-title__divider" />
    </header>
  )
}
