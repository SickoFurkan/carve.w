"use client"

import { useEffect, useRef } from "react"
import "mapbox-gl/dist/mapbox-gl.css"
import type mapboxgl from "mapbox-gl"

interface TripPin {
  id: string
  title: string
  destination: string
  start_date: string | null
  end_date: string | null
  total_budget: number | null
  currency: string
  status: string
  latitude: number | null
  longitude: number | null
}

const STATUS_COLORS: Record<string, string> = {
  planned: "#b8d8e8",
  active: "#10b981",
  completed: "#555d70",
  draft: "#7a8299",
}

export function TravelMapClient({ trips }: { trips: TripPin[] }) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const mapRef = useRef<mapboxgl.Map | null>(null)

  const tripsWithCoords = trips.filter((t) => t.latitude && t.longitude)
  const uniqueDestinations = new Set(trips.map((t) => t.destination)).size
  const upcomingCount = trips.filter((t) => t.status === "planned" || t.status === "active").length

  useEffect(() => {
    if (!mapContainer.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) return

    let map: mapboxgl.Map | undefined

    import("mapbox-gl").then((mod) => {
      mod.default.accessToken = token

      map = new mod.default.Map({
        container: mapContainer.current!,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [10, 30],
        zoom: 2,
      })

      mapRef.current = map

      map.on("load", () => {
        const bounds = new mod.default.LngLatBounds()
        let hasPoints = false

        tripsWithCoords.forEach((trip) => {
          if (!trip.latitude || !trip.longitude) return

          hasPoints = true
          bounds.extend([trip.longitude, trip.latitude])

          const color = STATUS_COLORS[trip.status] || STATUS_COLORS.draft
          const currencySymbol = trip.currency === "EUR" ? "\u20AC" : trip.currency === "USD" ? "$" : trip.currency === "GBP" ? "\u00A3" : trip.currency

          const el = document.createElement("div")
          el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:2px solid rgba(0,0,0,0.4);cursor:pointer;transition:transform 0.2s;`
          el.addEventListener("mouseenter", () => { el.style.transform = "scale(1.4)" })
          el.addEventListener("mouseleave", () => { el.style.transform = "scale(1)" })

          const dates = trip.start_date && trip.end_date
            ? `${new Date(trip.start_date).toLocaleDateString()} \u2014 ${new Date(trip.end_date).toLocaleDateString()}`
            : ""
          const budgetText = trip.total_budget ? `${currencySymbol}${trip.total_budget.toFixed(0)}` : ""

          const popup = new mod.default.Popup({
            offset: 20,
            closeButton: false,
            className: "travel-map-popup",
          }).setHTML(`
            <div style="font-family:system-ui;padding:4px 0;">
              <div style="font-size:14px;font-weight:600;color:white;">${trip.destination}</div>
              <div style="font-size:12px;color:#9da6b9;margin-top:2px;">${trip.title}</div>
              ${dates ? `<div style="font-size:11px;color:#7a8299;margin-top:4px;">${dates}</div>` : ""}
              ${budgetText ? `<div style="font-size:12px;font-weight:500;color:${color};margin-top:4px;">${budgetText}</div>` : ""}
              <a href="/dashboard/travel/${trip.id}" style="display:inline-block;margin-top:8px;font-size:11px;color:#b8d8e8;text-decoration:none;">View trip \u2192</a>
            </div>
          `)

          new mod.default.Marker({ element: el })
            .setLngLat([trip.longitude, trip.latitude])
            .setPopup(popup)
            .addTo(map!)
        })

        if (hasPoints) {
          map!.fitBounds(bounds, { padding: 80, maxZoom: 6 })
        }
      })
    })

    return () => {
      map?.remove()
      mapRef.current = null
    }
  }, [tripsWithCoords])

  return (
    <div className="h-full w-full relative">
      {/* Stats overlay */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 px-4 py-2 rounded-xl bg-[#0c0e14]/80 backdrop-blur-sm border border-white/[0.06]">
        <span className="text-sm text-white font-medium">{trips.length} trips</span>
        <span className="w-px h-4 bg-white/[0.08]" />
        <span className="text-sm text-[#7a8299]">{uniqueDestinations} destinations</span>
        <span className="w-px h-4 bg-white/[0.08]" />
        <span className="text-sm text-[#b8d8e8]">{upcomingCount} upcoming</span>
      </div>

      {/* Map */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* Popup styles */}
      <style jsx global>{`
        .travel-map-popup .mapboxgl-popup-content {
          background: #1c1f27;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 12px;
          padding: 12px 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .travel-map-popup .mapboxgl-popup-tip {
          border-top-color: #1c1f27;
        }
      `}</style>
    </div>
  )
}
