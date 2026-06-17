/**
 * WhatsApp Utility for sending order confirmation messages.
 * Supports Meta WhatsApp Cloud API and Twilio WhatsApp API.
 */

/**
 * Formats a phone number into E.164-like format required by WhatsApp (digits only, including country code).
 * For Pakistan, it handles formats like 03022401759, +923022401759, etc.
 * @param {string} phone 
 * @returns {string|null}
 */
export function formatPhoneNumberForWhatsApp(phone) {
  if (!phone) return null;
  
  // Remove all non-digit characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If it starts with 00, remove it
  if (cleaned.startsWith('00')) {
    cleaned = cleaned.substring(2);
  }
  
  // If it starts with 0 (very common in Pakistan, e.g., 03022401759) and is 11 digits
  if (cleaned.startsWith('0') && cleaned.length === 11) {
    cleaned = '92' + cleaned.substring(1);
  }
  
  // If it is 10 digits and doesn't start with 92, assume it's a Pakistani local number without leading 0
  if (cleaned.length === 10 && !cleaned.startsWith('92')) {
    cleaned = '92' + cleaned;
  }
  
  return cleaned;
}

/**
 * Sends a WhatsApp order confirmation to the customer.
 * Uses Meta Cloud API or Twilio API if credentials are provided in .env.
 * @param {object} order The order document from MongoDB.
 * @returns {Promise<{success: boolean, provider?: string, messageId?: string, error?: string}>}
 */
export async function sendWhatsAppOrderConfirmation(order) {
  const recipientPhone = formatPhoneNumberForWhatsApp(order.shippingAddress?.phone);
  
  if (!recipientPhone) {
    console.warn('[WhatsApp] Skipping send: No valid recipient phone number found.');
    return { success: false, error: 'Invalid phone number' };
  }

  // Format the text message body
  const itemsSummary = order.items
    .map(item => `• ${item.name} (${item.size || 'N/A'} / ${item.color || 'N/A'}) x${item.quantity}`)
    .join('\n');

  const textMessage = `Dear ${order.customerName},\n\nThank you for placing your order with *Zowear Collective*! \n\n*Order Details:*\n*Order ID:* #${order._id}\n*Total Amount:* Rs. ${order.totalAmount}\n*Payment Method:* ${order.paymentMethod}\n\n*Items Purchased:*\n${itemsSummary}\n\n*Shipping Address:*\n${order.shippingAddress.address}, ${order.shippingAddress.city}\n\nWe will notify you as soon as your package is dispatched. Thank you for shopping with us!\n\nBest regards,\n*Zowear Collective*\n+923022401759`;

  // 1. Check for Meta WhatsApp Cloud API credentials
  const metaToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const metaPhoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (metaToken && metaPhoneId) {
    try {
      console.log(`[WhatsApp] Attempting send to ${recipientPhone} via Meta Cloud API...`);
      
      const templateName = process.env.WHATSAPP_TEMPLATE_NAME;
      let payload = {};

      if (templateName && templateName !== 'none') {
        // Official template-based message
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientPhone,
          type: 'template',
          template: {
            name: templateName,
            language: {
              code: process.env.WHATSAPP_TEMPLATE_LANG || 'en_US'
            },
            components: [
              {
                type: 'body',
                parameters: [
                  { type: 'text', text: order.customerName },
                  { type: 'text', text: order._id.toString() },
                  { type: 'text', text: `Rs. ${order.totalAmount}` }
                ]
              }
            ]
          }
        };
      } else {
        // Free-form session text message (only works if user initiated chat in last 24h)
        payload = {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: recipientPhone,
          type: 'text',
          text: {
            body: textMessage
          }
        };
      }

      const response = await fetch(`https://graph.facebook.com/v18.0/${metaPhoneId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${metaToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('[WhatsApp] Message successfully sent via Meta Cloud API:', responseData);
        return { 
          success: true, 
          provider: 'meta', 
          messageId: responseData.messages?.[0]?.id 
        };
      } else {
        console.error('[WhatsApp] Meta Cloud API Error:', responseData);
        return { 
          success: false, 
          provider: 'meta', 
          error: responseData.error?.message || 'Meta API error' 
        };
      }
    } catch (err) {
      console.error('[WhatsApp] Failed to send via Meta Cloud API:', err);
      return { success: false, provider: 'meta', error: err.message };
    }
  }

  // 2. Check for Twilio WhatsApp API credentials
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuthToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_FROM_NUMBER;

  if (twilioSid && twilioAuthToken && twilioFrom) {
    try {
      console.log(`[WhatsApp] Attempting send to ${recipientPhone} via Twilio API...`);
      
      const bodyParams = new URLSearchParams();
      bodyParams.append('To', `whatsapp:+${recipientPhone}`);
      bodyParams.append('From', twilioFrom.startsWith('whatsapp:') ? twilioFrom : `whatsapp:${twilioFrom}`);
      bodyParams.append('Body', textMessage);

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuthToken}`).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams.toString()
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('[WhatsApp] Message successfully sent via Twilio:', responseData.sid);
        return { 
          success: true, 
          provider: 'twilio', 
          messageId: responseData.sid 
        };
      } else {
        console.error('[WhatsApp] Twilio API Error:', responseData);
        return { 
          success: false, 
          provider: 'twilio', 
          error: responseData.message || 'Twilio API error' 
        };
      }
    } catch (err) {
      console.error('[WhatsApp] Failed to send via Twilio API:', err);
      return { success: false, provider: 'twilio', error: err.message };
    }
  }

  // 3. Fallback: Not configured
  console.log('[WhatsApp] Automated message skipped: Meta/Twilio credentials are not configured in .env.');
  return { 
    success: false, 
    error: 'WhatsApp API credentials not configured in backend .env' 
  };
}
