import React from "react";

const LoadingFallback = () => {
    const [message, setMessage] = React.useState("Loading...");

    React.useEffect(() => {
        const messages = [
            "Loading...",
            "Fetching data...",
            "Almost there...",
            "Just a moment...",
            "Preparing your experience..."
        ];
        let index = 0;

        const interval = setInterval(() => {
            index = (index + 1) % messages.length;
            setMessage(messages[index]);
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    return (
        <>
            <div className="flex-col gap-4 w-full h-screen flex items-center justify-center">
                <div className="w-20 h-20 border-4 border-transparent text-blue-400 text-4xl animate-spin flex items-center justify-center border-t-blue-400 rounded-full">
                    <div className="w-16 h-16 border-4 border-transparent text-red-400 text-2xl animate-spin flex items-center justify-center border-t-red-400 rounded-full"></div>
        </div>
        {message && (
          <p className="text-sm text-gray-600 font-barlow">{message}</p>
        )}
      </div>
    </>
  );
};

export default LoadingFallback;
