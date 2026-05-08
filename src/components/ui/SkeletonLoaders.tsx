export function SessionCardSkeleton() {
  return (
    <div className="surface overflow-hidden rounded-[18px]">
      <div className="skeleton h-64" />
      <div className="space-y-4 p-5">
        <div className="skeleton h-4 w-28 rounded-full" />
        <div className="skeleton h-7 w-4/5 rounded-lg" />
        <div className="grid grid-cols-3 gap-3">
          <div className="skeleton h-14 rounded-xl" />
          <div className="skeleton h-14 rounded-xl" />
          <div className="skeleton h-14 rounded-xl" />
        </div>
        <div className="skeleton h-16 rounded-xl" />
      </div>
    </div>
  );
}

export function FeedSkeleton() {
  return (
    <div className="page-shell space-y-6">
      <div className="skeleton h-8 w-48 rounded-lg" />
      <div className="grid gap-5 lg:grid-cols-[0.72fr_0.28fr]">
        <div className="grid gap-5 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <SessionCardSkeleton key={index} />
          ))}
        </div>
        <div className="hidden space-y-4 lg:block">
          <div className="skeleton h-44 rounded-[18px]" />
          <div className="skeleton h-56 rounded-[18px]" />
        </div>
      </div>
    </div>
  );
}
