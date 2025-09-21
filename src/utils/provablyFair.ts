export interface FairnessData {
  serverSeed: string;
  serverSeedHash: string;
  clientSeed: string;
  combinedHash: string;
  timestamp: number;
  gameId: string;
}

export async function generateServerSeed(): Promise<string> {
  const buffer = new Uint8Array(32);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function hashSeed(seed: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(seed);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function combineSeeds(serverSeed: string, clientSeed: string): Promise<string> {
  const combined = `${serverSeed}:${clientSeed}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(combined);
  
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(serverSeed),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, data);
  return Array.from(new Uint8Array(signature), byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createDeterministicRandom(serverSeed: string, clientSeed: string): Promise<() => Promise<number>> {
  const combined = await combineSeeds(serverSeed, clientSeed);
  let index = 0;
  
  return async function(): Promise<number> {
    const data = `${combined}:${index++}`;
    const hash = await hashSeed(data);
    const bytes = hash.slice(0, 8);
    const num = parseInt(bytes, 16);
    return num / 0xFFFFFFFF;
  };
}

export async function verifyFairness(
  serverSeed: string,
  serverSeedHash: string,
  _clientSeed: string,
  _dealtCards: string[]
): Promise<boolean> {
  const calculatedHash = await hashSeed(serverSeed);
  if (calculatedHash !== serverSeedHash) {
    return false;
  }
  
  return true;
}

export function generateClientSeed(): string {
  const buffer = new Uint8Array(16);
  crypto.getRandomValues(buffer);
  return Array.from(buffer, byte => byte.toString(16).padStart(2, '0')).join('');
}

export async function createFairnessData(gameId: string, clientSeed?: string): Promise<FairnessData> {
  const serverSeed = await generateServerSeed();
  const serverSeedHash = await hashSeed(serverSeed);
  const finalClientSeed = clientSeed || generateClientSeed();
  const combinedHash = await combineSeeds(serverSeed, finalClientSeed);
  
  return {
    serverSeed,
    serverSeedHash,
    clientSeed: finalClientSeed,
    combinedHash,
    timestamp: Date.now(),
    gameId
  };
}

export class SeededRandom {
  private seed: number;
  
  constructor(seed: string) {
    this.seed = this.hashCode(seed);
  }
  
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
}

export function createSyncDeterministicRandom(serverSeed: string, clientSeed: string): () => number {
  const combined = `${serverSeed}:${clientSeed}`;
  const rng = new SeededRandom(combined);
  return () => rng.next();
}