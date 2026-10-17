import { BookCover } from './BookCover.jsx'
import { Candle, CrystalCluster } from './illustrations/TableProps.jsx'
import { PotionBottle } from './illustrations/PotionBottle.jsx'

/**
 * Mesa en penumbra con el grimorio cerrado: tres velas, cristales y una poción.
 * Las velas son la única fuente de luz de la escena («Luz de vela», DESIGN.md).
 */
export function TableScene({ open, onOpen }) {
  return (
    <div className="table-scene">
      <div className="table-scene__glow" aria-hidden="true" />
      <div className="table-scene__surface" aria-hidden="true" />
      <div className="table-scene__props" aria-hidden="true">
        <Candle className="prop prop--candle-1" height={110} />
        <Candle className="prop prop--candle-2" height={70} />
        <Candle className="prop prop--candle-3" height={92} />
        <PotionBottle className="prop prop--potion" color="#e0558f" deep="#7a1d52" glow="#ffa3cf" fill={0.6} />
        <CrystalCluster className="prop prop--crystals" color="#6e4a86" />
        {Array.from({ length: 6 }, (_, i) => (
          <span key={i} className={`mote mote--${i}`} />
        ))}
      </div>
      <BookCover open={open} onClick={onOpen} className="table-scene__book" />
    </div>
  )
}
