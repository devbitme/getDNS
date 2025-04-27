import { writable } from 'svelte/store';

type DNSRecord = {
    TTL: number;
    data: string;
};

type DNSResponse = {
    status: 'loading' | 'success' | 'error';
    data: DNSRecord[] | null;
    message?: string;
};

// Map to store DNS records by type
const cache = new Map<string, DNSResponse>();

// Create store for current domain
export const currentDomain = writable('example.com');

// Create store for current record type
export const currentRecordType = writable('A');

// Create store for DNS response
export const dnsResponse = writable<DNSResponse>({
    status: 'loading',
    data: null
});

// Function to fetch DNS records
export async function fetchDNSRecord(domain: string, type: string) {
    // Check cache first
    const cacheKey = `${domain}-${type}`;
    if (cache.has(cacheKey)) {
        dnsResponse.set(cache.get(cacheKey)!);
        return;
    }
    
    // Set loading state
    dnsResponse.set({ status: 'loading', data: null });
    
    try {
        const response = await fetch(`https://dns.google/resolve?name=${domain}&type=${type}`);
        const data = await response.json();
        
        const result: DNSResponse = data.Answer 
            ? { status: 'success', data: data.Answer }
            : { status: 'error', data: null, message: 'Record not found!' };
            
        // Update cache
        cache.set(cacheKey, result);
        
        // Update store
        dnsResponse.set(result);
    } catch (error) {
        dnsResponse.set({ 
            status: 'error', 
            data: null, 
            message: error instanceof Error ? error.message : 'Failed to fetch DNS record' 
        });
    }
}

// Clear cache for testing or when domain changes
export function clearCache() {
    cache.clear();
}