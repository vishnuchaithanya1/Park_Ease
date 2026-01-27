// Auto-retry wrapper for API calls to handle backend cold starts
export const fetchWithRetry = async (url, options = {}, maxRetries = 3, retryDelay = 3000) => {
    let lastError;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const response = await fetch(url, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });

            // If response is ok, return it
            if (response.ok) {
                return response;
            }

            // If it's a client error (4xx), don't retry
            if (response.status >= 400 && response.status < 500) {
                return response;
            }

            // Server error (5xx) - might be cold start, retry
            throw new Error(`Server error: ${response.status}`);

        } catch (error) {
            lastError = error;

            // If it's the last attempt, throw the error
            if (attempt === maxRetries) {
                throw lastError;
            }

            // Wait before retrying (exponential backoff)
            const waitTime = retryDelay * attempt;
            console.log(`Attempt ${attempt} failed. Retrying in ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }

    throw lastError;
};

// Helper to check if backend is awake
export const checkBackendHealth = async (baseUrl) => {
    try {
        const response = await fetch(`${baseUrl}/api/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5000), // 5 second timeout
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};
