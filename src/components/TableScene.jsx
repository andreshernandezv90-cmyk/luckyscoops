import { BookCover } from './BookCover.jsx'
import { ApothecaryJar, Candle, CrystalCluster, HerbSprig } from './illustrations/TableProps.jsx'
import { PotionBottle } from './illustrations/PotionBottle.jsx'

/** Mesa oscura con el grimorio cerrado, velas, cristales, hierbas y frascos. */
export function TableScene({ open, onOpen }) {
  return (
    <div className="table-scene">
      <div className="table-scene__glow" aria-hidden="true" />
      <div className="table-scene__surface" aria-hidden="true" />
      <div className="table-scene__props" aria-hidden="true">
        <ApothecaryJar className="prop prop--jar-left" color="#4b2a7a" />
        <ApothecaryJar className="prop prop--jar-right" color="#8a2a68" label={false} />
        <Candle className="prop prop--candle-1" height={110} />
        <Candle className="prop prop--candle-2" height={70} />
        <Candle className="prop prop--candle-3" height={92} />
        <PotionBottle className="prop prop--potion" color="#e0558f" deep="#7a1d52" glow="#ffa3cf" fill={0.6} />
        <CrystalCluster className="prop prop--crystals" />
        <HerbSprig className="prop prop--herbs" />
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} className={`mote mote--${i}`} />
        ))}
      </div>
      <BookCover open={open} onClick={onOpen} className="table-scene__book" />
    </div>
  )
}
