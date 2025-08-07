export default function LoadingSpinner({ size = "md" }) {
  const sizes = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizes[size]} animate-spin rounded-full border-4 border-solid border-white border-t-transparent`}
      ></div>
    </div>
  );
}