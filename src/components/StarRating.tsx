import { useId, useState } from 'react'

interface StarRatingProps {
  /** 0-10 分 */
  value: number
  /** 传入则为交互模式 */
  onChange?: (value: number) => void
  readOnly?: boolean
  /** 单颗星像素大小 */
  size?: number
}

function Star({ fill, size }: { fill: number; size: number }) {
  // fill: 0~1，表示这颗星的填充比例（支持半星）
  const id = useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
      <defs>
        <linearGradient id={id}>
          <stop offset={`${fill * 100}%`} stopColor="#f59e0b" />
          <stop offset={`${fill * 100}%`} stopColor="#e2e8f0" />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 .587l3.668 7.431 8.2 1.192-5.934 5.785 1.401 8.169L12 18.896l-7.335 3.868 1.401-8.169L.132 9.21l8.2-1.192z"
      />
    </svg>
  )
}

/** 10 分制评分，用 5 颗星（每颗代表 2 分）展示，支持半星与交互打分 */
export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 24,
}: StarRatingProps) {
  const [hover, setHover] = useState<number | null>(null)
  const display = hover ?? value
  const interactive = !readOnly && !!onChange

  return (
    <div
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => setHover(null)}
    >
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, display / 2 - i))
        if (!interactive) return <Star key={i} fill={fill} size={size} />
        return (
          <span key={i} className="relative inline-flex cursor-pointer">
            <Star fill={fill} size={size} />
            {/* 左右两个半星热区：左=奇数分，右=偶数分 */}
            <button
              type="button"
              aria-label={`${i * 2 + 1} 分`}
              className="absolute left-0 top-0 h-full w-1/2"
              onMouseEnter={() => setHover(i * 2 + 1)}
              onClick={() => onChange!(i * 2 + 1)}
            />
            <button
              type="button"
              aria-label={`${i * 2 + 2} 分`}
              className="absolute right-0 top-0 h-full w-1/2"
              onMouseEnter={() => setHover(i * 2 + 2)}
              onClick={() => onChange!(i * 2 + 2)}
            />
          </span>
        )
      })}
    </div>
  )
}
