'use client'

import Image from 'next/image'

export default function PlumeBackground() {
  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none z-0">
      <div className="absolute inset-0 opacity-[0.18]">
        <Image
          src="/img/plume.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  )
}
