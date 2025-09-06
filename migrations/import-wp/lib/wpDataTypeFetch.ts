import https from 'https';
import { BASE_URL, PER_PAGE } from '../constants';
import type { WordPressDataType, WordPressDataTypeResponses } from '../types';

// Optional: globally ignore self-signed SSL (DEV ONLY)
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// App password credentials
const WP_USERNAME = 'syrah';
const WP_APP_PASSWORD = 'dRQR O9xC kWMX Q2zO 5GYY kBb4'; // Your app password with spaces
const AUTH_HEADER = 'Basic ' + Buffer.from(`${WP_USERNAME}:${WP_APP_PASSWORD}`).toString('base64');

// Dev log to verify header
console.log('AUTH_HEADER:', AUTH_HEADER);

// Local HTTPS agent (allows self-signed certs)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export async function wpDataTypeFetch<T extends WordPressDataType>(
  type: T,
  page: number
): Promise<WordPressDataTypeResponses[T] | null> {
  const wpApiUrl = new URL(`${BASE_URL}/${type}`);
  wpApiUrl.searchParams.set('page', page.toString());
  wpApiUrl.searchParams.set('per_page', PER_PAGE.toString());

  console.log('Fetching URL:', wpApiUrl.toString());

  try {
    const res = await fetch(wpApiUrl.toString(), {
      agent: httpsAgent,
      headers: {
        Authorization: AUTH_HEADER,
        Accept: 'application/json',
      },
    });

    if (!res.ok) {
      console.error('❌ Response Status:', res.status);
      const body = await res.text();
      console.error('❌ Response Body:', body);
      return null;
    }

    const data = await res.json();
    return data;
  } catch (error: any) {
    console.error('❌ Fetch Error:', error.name, error.message);
    return null;
  }
}
