

import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if a component has been rendered or mounted.
 * @returns {boolean} - A boolean value indicating if the component has been rendered.
 */
function useRendered() {
  const [isRendered, setIsRendered] = useState(false);

  useEffect(() => {
    setIsRendered(true);
    // No cleanup action needed as we only set the state once on mount
  }, []);

  return isRendered;
}

export default useRendered;