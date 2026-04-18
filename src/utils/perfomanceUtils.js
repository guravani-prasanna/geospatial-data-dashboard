export const measurePerformance = (label, fn) => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  const duration = end - start;

  console.log(`${label}: ${duration.toFixed(2)}ms`);

  return { result, duration };
};

export const measureAsync = async (label, fn) => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  const duration = end - start;

  console.log(`${label}: ${duration.toFixed(2)}ms`);

  return { result, duration };
};

export const measureFrameRate = (callback, duration = 1000) => {
  let frameCount = 0;
  let totalTime = 0;

  const startTime = performance.now();

  const measureFrame = () => {
    const currentTime = performance.now();
    totalTime = currentTime - startTime;

    if (totalTime < duration) {
      frameCount++;
      callback();
      requestAnimationFrame(measureFrame);
    } else {
      const fps = (frameCount / totalTime) * 1000;
      console.log(`Average FPS: ${fps.toFixed(2)}`);
      return fps;
    }
  };

  requestAnimationFrame(measureFrame);
};
