export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[/\\]/g, '').trim();
};

export const shouldSimulateFailure = (failureRate: number): boolean => {
  return Math.random() < failureRate;
};

export const buildMeta = (requestId: string) => ({
  requestId,
  timestamp: new Date().toISOString(),
});
