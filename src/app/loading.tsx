export default function Loading() {
  return (
    <div className="min-h-screen bg-light flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
        <p className="text-dark/60 text-sm">Loading...</p>
      </div>
    </div>
  );
}