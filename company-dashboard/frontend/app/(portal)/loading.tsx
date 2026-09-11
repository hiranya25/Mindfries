export default function PortalLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="space-y-2">
        <div className="h-3 w-32 rounded bg-black/10" />
        <div className="h-8 w-48 rounded bg-black/10" />
      </div>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="hair-card h-24 p-5">
            <div className="h-3 w-16 rounded bg-black/10" />
            <div className="mt-3 h-7 w-10 rounded bg-black/10" />
          </div>
        ))}
      </div>
      <div className="hair-card h-64 p-5">
        <div className="h-full w-full rounded bg-black/[0.04]" />
      </div>
    </div>
  );
}
