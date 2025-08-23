import { cn } from "@/lib/utils";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function Loader({ 
  size = "md", 
  text = "Loading...", 
  fullScreen = false,
  className 
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  const containerClasses = fullScreen 
    ? "fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center"
    : "flex flex-col items-center justify-center py-12";

  return (
    <div className={cn(containerClasses, className)}>
      <div className="relative">
        {/* Outer spinning ring */}
        <div 
          className={cn(
            "animate-spin rounded-full border-2 border-gray-200",
            sizeClasses[size]
          )}
        />
        {/* Inner spinning ring */}
        <div 
          className={cn(
            "absolute top-0 left-0 animate-spin rounded-full border-2 border-transparent border-t-black",
            sizeClasses[size]
          )}
          style={{ animationDirection: "reverse", animationDuration: "0.8s" }}
        />
        {/* Center dot */}
        <div 
          className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black rounded-full",
            size === "sm" ? "h-1 w-1" : size === "md" ? "h-1.5 w-1.5" : "h-2 w-2"
          )}
        />
      </div>
      
      {text && (
        <p className={cn(
          "mt-4 text-gray-600 font-light tracking-wide",
          textSizeClasses[size]
        )}>
          {text}
        </p>
      )}
    </div>
  );
}

// Loading overlay component for page transitions
export function LoadingOverlay({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="fixed inset-0 bg-white/95 backdrop-blur-sm z-50 flex flex-col items-center justify-center transition-opacity duration-300">
      <div className="relative">
        {/* Logo or brand element */}
        <div className="text-3xl font-light text-black mb-8 tracking-wider">YEWA</div>
        
        {/* Animated loading bars */}
        <div className="flex space-x-1 justify-center">
          <div className="h-8 w-1 bg-black animate-pulse" style={{ animationDelay: "0ms" }} />
          <div className="h-8 w-1 bg-black animate-pulse" style={{ animationDelay: "150ms" }} />
          <div className="h-8 w-1 bg-black animate-pulse" style={{ animationDelay: "300ms" }} />
          <div className="h-8 w-1 bg-black animate-pulse" style={{ animationDelay: "450ms" }} />
        </div>
        
        <p className="mt-6 text-gray-600 text-sm font-light tracking-wide text-center">
          {text}
        </p>
      </div>
    </div>
  );
}

// Mini loader for buttons and small components
export function MiniLoader({ className }: { className?: string }) {
  return (
    <div className={cn("relative inline-block", className)}>
      <div className="h-4 w-4 animate-spin rounded-full border-2 border-transparent border-t-current opacity-75" />
    </div>
  );
}