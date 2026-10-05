import Link from "next/link";
import { Heart, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-light flex items-center justify-center p-4">
      <div className="text-center max-w-lg">
        <div className="text-[120px] font-bold text-primary leading-none select-none">
          404
        </div>
        <h1 className="text-3xl font-bold text-dark mt-4 mb-3">
          Page Not Found
        </h1>
        <p className="text-dark/70 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" />
            Go Home
          </Link>
          <Link href="/donate" className="btn-ghost">
            <Heart className="w-4 h-4" fill="currentColor" />
            Donate Instead
          </Link>
        </div>
      </div>
    </div>
  );
}