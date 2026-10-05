export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-64 bg-light rounded-lg animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-6">
            <div className="w-12 h-12 rounded-full bg-light animate-pulse mb-4" />
            <div className="h-8 w-20 bg-light rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-light rounded animate-pulse" />
          </div>
        ))}
      </div>
      <div className="card p-6">
        <div className="h-6 w-48 bg-light rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-light rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}