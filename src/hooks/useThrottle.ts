export function throttle<T, R>(func: (arg: T) => R, delay: number): (arg: T) => void {
  let inThrottle = false;
  let lastArg: T | null = null;

  return function (arg: T) {
    if (!inThrottle) {
      func(arg);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArg !== null) {
          func(lastArg);
          lastArg = null;
        }
      }, delay);
    } else {
      lastArg = arg;
    }
  };
}
