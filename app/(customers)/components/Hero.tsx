import { QrCode } from "lucide-react"

function Hero() {
  return (
    <div className="bg-bark px-5 pt-6 pb-7 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 rounded-full bg-clay opacity-10 translate-x-8 -translate-y-8" />
            <div className="flex items-center gap-2 mb-4">
              <QrCode className="w-3.5 h-3.5 text-white/60" />
              <span className="text-[11px] text-white/60 font-medium">QR scanned</span>
            </div>
            <h1 className="text-[22px] font-medium text-white leading-snug">
              Baan Rim Naam<br />Thai Kitchen
            </h1>
            <p className="text-[13px] text-clay-mid mt-1">Sukhumvit, Bangkok · Open until 10 PM</p>
            <div className="mt-4 inline-flex items-center gap-2 bg-clay rounded-xl px-3.5 py-2">
              <span className="text-[11px] text-white/75">Table</span>
              <span className="w-px h-4 bg-white/25" />
              <span className="text-[15px] font-medium text-white">A-07</span>
            </div>
          </div>
  )
}

export default Hero
