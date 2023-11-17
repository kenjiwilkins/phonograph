import { useState, useEffect } from "react";

const Loading = () => {
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setDotCount((dotCount + 1) % 3);
    }, 500);

    return () => clearInterval(interval);
  }, [dotCount]);

  return (
    <div className="min-w-full min-h-full flex items-center justify-center">
      <span style={{ fontSize: "2em", color: "white" }}>
        loading all of your liked albums
        {dotCount === 0 ? "" : ""}
        {dotCount === 1 ? "." : ""}
        {dotCount === 2 ? ".." : ""}
        {dotCount === 3 ? "..." : ""}
      </span>
    </div>
  );
};

export default Loading;
