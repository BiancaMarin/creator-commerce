import * as React from "react";

/**
 * Returns `value` after it has stopped changing for `delayMs`.
 *
 * Used by the /explore search box so a URL update — and the query behind it —
 * costs one round trip per pause rather than one per keystroke.
 *
 * The state is set inside the timeout callback rather than in the effect body,
 * which is both what makes it a debounce and what keeps it clear of the
 * `react-hooks/set-state-in-effect` rule.
 */
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = React.useState(value);

  React.useEffect(() => {
    const timeout = setTimeout(() => setDebounced(value), delayMs);

    // Every change restarts the clock — this is the debounce, not cleanup
    // hygiene. Without it each keystroke would fire on its own schedule.
    return () => clearTimeout(timeout);
  }, [value, delayMs]);

  return debounced;
}
