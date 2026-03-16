/** Shimmer skeleton blocks used as pendingComponent for route loaders. */
import type React from 'react'

function Bone({ className, style }: { className: string; style?: React.CSSProperties }) {
  return <div className={`shimmer rounded ${className}`} style={style} />
}

// ─── Browse ───────────────────────────────────────────────────────────────────

function GameCardSkeleton() {
  return (
    <div className="card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bone className="w-7 h-7 rounded-full" />
          <Bone className="w-24 h-4" />
          <Bone className="w-6 h-4" />
          <Bone className="w-24 h-4" />
          <Bone className="w-7 h-7 rounded-full" />
        </div>
        <Bone className="w-16 h-5 rounded-full" />
      </div>
      <Bone className="w-40 h-3" />
    </div>
  )
}

export function BrowsePending() {
  return (
    <div className="max-w-3xl mx-auto px-4 pb-24 pt-6">
      <div className="flex gap-2 mb-4 flex-wrap">
        {[80, 72, 110, 88, 76].map((w, i) => (
          <Bone key={i} className={`h-8 rounded-full`} style={{ width: w }} />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 8 }).map((_, i) => <GameCardSkeleton key={i} />)}
      </div>
    </div>
  )
}

// ─── Home ────────────────────────────────────────────────────────────────────

export function HomePending() {
  return (
    <div className="max-w-3xl mx-auto px-4 pb-24">
      <div className="py-14 text-center flex flex-col items-center gap-3">
        <Bone className="w-48 h-20" />
        <Bone className="w-64 h-4" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => <GameCardSkeleton key={i} />)}
      </div>
    </div>
  )
}

// ─── Game detail ──────────────────────────────────────────────────────────────

export function GameDetailPending() {
  return (
    <div className="max-w-3xl mx-auto pb-24">
      {/* Hero */}
      <div className="px-4 pt-6 pb-8">
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-3 flex-1">
            <Bone className="w-14 h-14 rounded-full" />
            <div className="flex flex-col gap-2">
              <Bone className="w-12 h-3" />
              <Bone className="w-24 h-6" />
            </div>
          </div>
          <Bone className="w-28 h-12" />
          <div className="flex items-center gap-3 flex-1 justify-end">
            <div className="flex flex-col gap-2 items-end">
              <Bone className="w-12 h-3" />
              <Bone className="w-24 h-6" />
            </div>
            <Bone className="w-14 h-14 rounded-full" />
          </div>
        </div>
        <Bone className="w-3/4 h-4" />
      </div>
      {/* Reviews */}
      <div className="px-4 flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 flex gap-3">
            <Bone className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <Bone className="w-32 h-4" />
              <Bone className="w-full h-3" />
              <Bone className="w-2/3 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Feed ────────────────────────────────────────────────────────────────────

export function FeedPending() {
  return (
    <div className="max-w-3xl mx-auto px-4 pb-24">
      <div className="py-8">
        <Bone className="w-48 h-10 mb-2" />
        <Bone className="w-72 h-4" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card p-4 flex gap-3">
            <Bone className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 flex flex-col gap-2">
              <Bone className="w-56 h-4" />
              <Bone className="w-24 h-3" />
              <Bone className="w-3/4 h-3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export function ProfilePending() {
  return (
    <div className="max-w-3xl mx-auto px-4 pb-24">
      {/* Header */}
      <div className="pt-8 pb-6 flex gap-5 items-start">
        <Bone className="w-[76px] h-[76px] rounded-full flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2.5">
          <Bone className="w-40 h-7" />
          <Bone className="w-24 h-4" />
          <Bone className="w-64 h-3" />
        </div>
      </div>
      {/* Stats */}
      <div className="grid grid-cols-4 gap-2.5 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-3 flex flex-col items-center gap-2">
            <Bone className="w-10 h-6" />
            <Bone className="w-14 h-2" />
          </div>
        ))}
      </div>
      {/* Review rows */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="card p-4 flex flex-col gap-2">
            <Bone className="w-48 h-4" />
            <Bone className="w-32 h-3" />
          </div>
        ))}
      </div>
    </div>
  )
}