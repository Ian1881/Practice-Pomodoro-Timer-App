let workerInterval = null;

self.onmessage = function (e) {
  if (e.data === 'start') {
    workerInterval = setInterval(() => {
      self.postMessage('tick');
    }, 1000);
  } else if (e.data === 'stop') {
    clearInterval(workerInterval);
  }
};
