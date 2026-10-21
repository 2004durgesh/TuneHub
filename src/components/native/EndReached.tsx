import { useEffect } from 'react';

/**
 * Rendered with a lazy list's last row. Recycling only mounts that row once the end of the list is
 * within the overscan window, so mounting it is the list's "end reached".
 */
export function EndReached({ onReached }: { onReached: () => void }) {
  useEffect(() => {
    onReached();
  }, [onReached]);
  return null;
}
