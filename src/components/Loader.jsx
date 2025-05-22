import React, { useEffect, useState } from 'react';

const Loader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((oldProgress) => {
        const newProgress = oldProgress + 10;
        if (newProgress >= 100) {
          clearInterval(timer);
          return 100;
        }
        return newProgress;
      });
    }, 200);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 z-50">
      <div className="flex flex-col items-center h-20 w-auto  px-4">
        <img 
          src="/Images/logo.png" 
          alt="Logo" 
          loading='lazy'
          className="w-full h-full mb-8"
        />
        <div className="w-full bg-red-100 rounded-full h-2.5">
          <div 
            className="bg-[#bd5b4c] h-1.5 rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="mt-4 text-gray-600">Loading... {progress}%</div>
      </div>
    </div>
  );
};

export default Loader; 