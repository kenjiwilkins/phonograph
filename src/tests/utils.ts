export async function flashPromise() {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 0);
  });
}
