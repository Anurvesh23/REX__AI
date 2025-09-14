"use client"

import { useEffect, useRef } from "react"
import { animate, motion, useInView } from "framer-motion"

type CountUpProps = {
  to: number
  className?: string
}

export function CountUp({ to, className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (inView && ref.current) {
      const controls = animate(0, to, {
        duration: 1.5,
        onUpdate(value) {
          if (ref.current) {
            ref.current.textContent = value.toFixed(0)
          }
        },
      })
      return () => controls.stop()
    }
  }, [inView, to])

  return <motion.span ref={ref} className={className} />
}