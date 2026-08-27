import crypto from 'crypto';

export const hashData = (data) => {
  if (!data) return undefined;
  return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
};

export const sendMetaEvent = async (eventName, eventId, userData, customData) => {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  if (!pixelId || !accessToken) {
    console.warn('Meta Pixel ID or Access Token is missing. CAPI event not sent.');
    return;
  }

  const url = `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`;

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_id: eventId,
        user_data: {
          em: [hashData(userData.email)],
          ph: userData.phone ? [hashData(userData.phone)] : undefined,
          fn: userData.firstName ? [hashData(userData.firstName)] : undefined,
          ln: userData.lastName ? [hashData(userData.lastName)] : undefined,
          client_ip_address: userData.clientIp,
          client_user_agent: userData.clientUserAgent,
        },
        custom_data: customData,
      },
    ],
  };

  // Clean undefined values from user_data
  Object.keys(payload.data[0].user_data).forEach(key => 
    payload.data[0].user_data[key] === undefined && delete payload.data[0].user_data[key]
  );

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    if (!response.ok) {
      console.error('Meta CAPI Error:', result);
    }
  } catch (error) {
    console.error('Meta CAPI Request Failed:', error);
  }
};
