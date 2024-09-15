// lib/cache.js
const cache = new Map();

export function getCachedResponse(key) {
  return cache.get(key);
}

export function setCachedResponse(key, response) {
  cache.set(key, response);
}

