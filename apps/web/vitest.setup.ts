import '@testing-library/jest-dom/vitest';

// The env module validates at import time, so tests need a valid site URL.
process.env.NEXT_PUBLIC_SITE_URL ??= 'http://localhost:3000';
process.env.API_URL ??= 'http://localhost:4000';
