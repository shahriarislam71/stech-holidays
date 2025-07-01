import LoadingSpinner from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#5A53A7] to-[#4a8b9a] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );
}