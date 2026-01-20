export async function sendMessage(message, sessionId) {
  try {
    const response = await fetch('https://deeplearning.pcr.ac.id/webhook/bot-parawisata-pekanbaru', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, sessionId }),
    });

    if (!response.ok) {
        console.error('API Error Response:', response.status, response.statusText);
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Call Failed:', error);
    throw error;
  }
}
