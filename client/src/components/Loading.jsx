const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
      <div className="text-center">
        {/* Simple spinner */}
        <div className="relative w-16 h-16 mx-auto mb-4">
          <div className="absolute inset-0 border-4 border-black/20 dark:border-white/20 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-transparent border-t-black dark:border-t-white rounded-full animate-spin"></div>
        </div>

        {/* Loading text */}
        <p className="text-lg text-black dark:text-white animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export default Loading;
