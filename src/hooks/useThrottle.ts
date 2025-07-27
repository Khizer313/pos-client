export function throttle<T, R>(
  func: (arg: T) => R,
  delay: number
): ((arg: T) => void) & { cancel: () => void } {
  let inThrottle = false;
  let lastArg: T | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  const throttled = function (arg: T) {
    if (!inThrottle) {
      func(arg);
      inThrottle = true;

      timeoutId = setTimeout(() => {
        inThrottle = false;
        if (lastArg !== null) {
          func(lastArg);
          lastArg = null;
        }
        timeoutId = null;
      }, delay);
    } else {
      lastArg = arg;
    }
  };

  throttled.cancel = () => {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = null;
    inThrottle = false;
    lastArg = null;
  };

  return throttled;
}
