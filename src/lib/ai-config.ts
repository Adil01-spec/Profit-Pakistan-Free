export function getLemonfoxKey() {
  const key = process.env.NEXT_PUBLIC_LEMONFOX_API_KEY;
  if (!key || key === 'your_real_lemonfox_api_key') {
    throw new Error(
      "Missing Lemonfox AI API key. Please set NEXT_PUBLIC_LEMONFOX_API_KEY in your .env file."
    );
  }
  return key;
}
