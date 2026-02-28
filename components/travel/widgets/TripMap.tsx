"use client"

import { useEffect, useRef } from "react"
import "mapbox-gl/dist/mapbox-gl.css"
import type { TripDay } from "@/lib/ai/travel-schemas"
import type mapboxgl from "mapbox-gl"

interface TripMapProps {
  days: TripDay[]
  activeDay?: number
}

const DAY_COLORS = [
  "#b8d8e8", "#10b981", "#f59e0b", "#a78bfa",
  "#f472b6", "#fb923c", "#34d399", "#818cf8",
]

export function TripMap({ days, activeDay }: TripMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapboxModule = useRef<typeof import("mapbox-gl") | null>(null)
  const markersRef = useRef<mapboxgl.Marker[]>([])

  // Initialize map once
  useEffect(() => {
    if (!mapContainer.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    let map: mapboxgl.Map | undefined

    import("mapbox-gl").then((mod) => {
      mapboxModule.current = mod
      mod.default.accessToken = token

      map = new mod.default.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [0, 20],
        zoom: 2,
      })

      mapRef.current = map
    })

    return () => {
      map?.remove()
      mapRef.current = null
      mapboxModule.current = null
    }
  }, [])

  // Update markers when days or activeDay changes
  useEffect(() => {
    const map = mapRef.current
    const mod = mapboxModule.current
    if (!map || !mod) return

    const updateMarkers = () => {
      // Remove existing markers
      markersRef.current.forEach((m) => m.remove())
      markersRef.current = []

      const bounds = new mod.default.LngLatBounds()
      let hasPoints = false

      const daysToShow = activeDay !== undefined ? [days[activeDay]] : days

      daysToShow.forEach((day, dayIdx) => {
        const actualDayIdx = activeDay !== undefined ? activeDay : dayIdx
        const color = DAY_COLORS[actualDayIdx % DAY_COLORS.length]

        day.activities.forEach((activity) => {
          if (!activity.latitude || !activity.longitude) return

          hasPoints = true
          bounds.extend([activity.longitude, activity.latitude])

          const el = document.createElement("div")
          el.style.cssText = `width:12px;height:12px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,0.3);cursor:pointer;`

          const marker = new mod.default.Marker({ element: el })
            .setLngLat([activity.longitude, activity.latitude])
            .addTo(map)

          markersRef.current.push(marker)
        })
      })

      if (hasPoints) {
        map.fitBounds(bounds, { padding: 50, maxZoom: 14 })
      }
    }

    if (map.isStyleLoaded()) {
      updateMarkers()
    } else {
      map.on("load", updateMarkers)
    }
  }, [days, activeDay])

  return (
    <div
      ref={mapContainer}
      className="w-full h-full rounded-xl overflow-hidden border border-white/[0.06]"
      style={{ minHeight: 300 }}
    />
  )
}
