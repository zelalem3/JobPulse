import { useEffect } from "react";

interface ScrollToTopProps {
  dependencies: any[];
}

export default function ScrollToTopOnPageChange({ dependencies }: ScrollToTopProps) {
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth", // Change to "auto" if you want instant jumping
    });
  }, dependencies);

  return null;
}