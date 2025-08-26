import Image from 'next/image'

type Props = {
  title: string
  slug: string
  image?: string | null
  className?: string
}

// simple stable hash -> hue
function hashHue(input: string) {
  let h = 0
  for (let i = 0; i < input.length; i++) h = (h * 31 + input.charCodeAt(i)) >>> 0
  return h % 360
}
function initials(t: string) {
  return t.split(/\s+/).slice(0, 2).map(s => s[0]?.toUpperCase() ?? '').join('')
}

export default function Thumb({ title, slug, image, className = '' }: Props) {
  if (image) {
    return (
      <div className={`relative aspect-[16/9] overflow-hidden rounded-t-xl ${className}`}>
        <Image src={image} alt="" fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
      </div>
    )
  }
const hue = (hashHue(slug) % 20) - 10 + 38;    // bias around accent hue 38°
const hue2 = (hue + 18) % 360
return (
  <div
    className={`aspect-[16/9] rounded-t-xl grid place-items-center text-white ${className}`}
    style={{
      background: `linear-gradient(135deg,
        hsl(${hue} 70% 45%) 0%,
        hsl(${hue2} 70% 45%) 100%)`,
    }}
  >
    <span className="text-2xl font-semibold tracking-wide drop-shadow-sm">
      {initials(title) || 'BG'}
    </span>
  </div>
)
}
