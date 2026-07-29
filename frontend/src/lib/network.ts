/**
 * Network connectivity detection and offline support
 */

export type NetworkStatus = 'online' | 'offline' | 'unknown';

export interface NetworkState {
  isOnline: boolean;
  isOffline: boolean;
  type: NetworkStatus;
}

let networkState: NetworkState = {
  isOnline: true,
  isOffline: false,
  type: 'unknown',
};

const listeners: Set<(state: NetworkState) => void> = new Set();

export function getNetworkState(): NetworkState {
  return networkState;
}

export function isOnline(): boolean {
  return networkState.isOnline;
}

export function isOffline(): boolean {
  return networkState.isOffline;
}

export function subscribeToNetworkChanges(callback: (state: NetworkState) => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

function notifyListeners(): void {
  listeners.forEach((callback) => callback(networkState));
}

function updateNetworkState(): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return;
  }

  const isOnline = navigator.onLine;
  networkState = {
    isOnline,
    isOffline: !isOnline,
    type: isOnline ? 'online' : 'offline',
  };
  notifyListeners();
}

export function initNetworkMonitoring(): void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return;
  }

  updateNetworkState();

  window.addEventListener('online', updateNetworkState);
  window.addEventListener('offline', updateNetworkState);
}

export function cleanupNetworkMonitoring(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.removeEventListener('online', updateNetworkState);
  window.removeEventListener('offline', updateNetworkState);
  listeners.clear();
}

// Auto-initialize in browser
if (typeof window !== 'undefined') {
  initNetworkMonitoring();
}
