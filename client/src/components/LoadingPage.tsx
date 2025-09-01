export const LoadingPage = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-8">
        {/* Square Spinner */}
        <div className="relative">
          <div className="w-16 h-16 border-4 border-muted/20 rounded-lg animate-spin">
            <div className="absolute inset-0 border-4 border-transparent border-t-primary border-r-primary rounded-lg animate-spin"></div>
          </div>
        </div>
        
        {/* YEWA Brand Text */}
        <div className="text-center animate-fade-in">
          <h1 className="text-4xl font-bold tracking-[0.2em] text-foreground mb-3">
            YEWA
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-primary/0 via-primary to-primary/0 mx-auto animate-pulse"></div>
          <p className="text-sm text-muted-foreground mt-4 tracking-wide">
            Fashion Forward
          </p>
        </div>
      </div>
    </div>
  );
};