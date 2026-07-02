import nodemailer from 'nodemailer';
import Design from '../models/Design.js';

// Helper to format currency
const formatPrice = (p) => {
  const price = typeof p === "number" ? p : parseFloat(p) || 0;
  return `Rs. ${price.toLocaleString("en-PK")}`;
};

export async function sendOrderConfirmationEmail(order) {
  let transporter;
  let testAccountUrl = null;

  // 1. Check SMTP Env variables
  if (
    (process.env.SMTP_SERVICE || process.env.SMTP_HOST) &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  ) {
    const transportConfig = {
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    };

    if (process.env.SMTP_SERVICE) {
      transportConfig.service = process.env.SMTP_SERVICE;
    } else {
      transportConfig.host = process.env.SMTP_HOST;
      transportConfig.port = parseInt(process.env.SMTP_PORT || '587');
      transportConfig.secure = process.env.SMTP_PORT === '465';
    }

    transporter = nodemailer.createTransport(transportConfig);
  } else {
    // 2. Fallback to Ethereal Test Account
    try {
      console.log('No SMTP config found. Creating an Ethereal test account...');
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    } catch (err) {
      console.error('Failed to create Ethereal test account:', err);
      // If offline/Ethereal fails, return mock URL and log
      console.log('Sending mock order confirmation email locally for debug.');
      return { success: true, localOnly: true, html: getTemplate(order) };
    }
  }

  // Resolve digital designs drive links
  const resolvedItems = [];
  if (order.items && order.items.length > 0) {
    for (const item of order.items) {
      const itemObj = item.toObject ? item.toObject() : item;
      if (itemObj.size === "Digital" || itemObj.category === "Embroidery Design") {
        try {
          const designObj = await Design.findById(itemObj.productId);
          if (designObj && designObj.driveLink) {
            itemObj.driveLink = designObj.driveLink;
          }
        } catch (err) {
          console.error("Error retrieving drive link for email confirmation:", err);
        }
      }
      resolvedItems.push(itemObj);
    }
  }
  const enrichedOrder = {
    ...order.toObject ? order.toObject() : order,
    items: resolvedItems
  };

  const fromEmail = process.env.SMTP_FROM || 'Zowears Collective <orders@zowears.com>';
  const toEmail = enrichedOrder.email;
  const subject = `ZOWEARS COLLECTIVE - Order Confirmed #${enrichedOrder._id || 'Pending'}`;
  const htmlContent = getTemplate(enrichedOrder);

  try {
    const info = await transporter.sendMail({
      from: fromEmail,
      to: toEmail,
      subject: subject,
      html: htmlContent,
    });

    console.log(`Order confirmation email sent to ${toEmail}`);
    if (info && info.messageId) {
      console.log('Message ID: %s', info.messageId);
    }
    
    // If it's an ethereal email test account, print the preview URL
    if (nodemailer.getTestMessageUrl(info)) {
      testAccountUrl = nodemailer.getTestMessageUrl(info);
      console.log('Preview URL: %s', testAccountUrl);
    }

    return {
      success: true,
      messageId: info.messageId,
      previewUrl: testAccountUrl,
      html: htmlContent
    };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    return {
      success: false,
      error: error.message,
      html: htmlContent
    };
  }
}

function getTemplate(order) {
  const digitalItems = (order.items || []).filter((it) => it.driveLink);
  let digitalDownloadsHtml = '';
  if (digitalItems.length > 0) {
    const downloadRows = digitalItems
      .map(
        (item) => `
      <div style="margin-bottom: 16px; padding: 16px; background-color: #12100e; border: 1px solid #c8a96e; text-align: left;">
        <div style="font-weight: bold; font-size: 14px; color: #ffffff; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Space Grotesk', sans-serif;">${item.name}</div>
        <div style="font-size: 11px; color: #8a8377; margin-top: 4px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase;">Formats: DST, PES, JEF, XXX, VP3, HUS, EXP (EMB Excluded)</div>
        <a href="${item.driveLink}" target="_blank" style="display: inline-block; margin-top: 12px; background-color: #c8a96e; color: #000000; text-decoration: none; padding: 10px 18px; font-weight: bold; font-family: 'JetBrains Mono', monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">
          DOWNLOAD FROM DRIVE →
        </a>
      </div>
    `
      )
      .join('');

    digitalDownloadsHtml = `
      <!-- Digital Downloads Section -->
      <div style="margin-bottom: 40px; border: 1px solid #c8a96e; padding: 24px; background-color: #0d0c0b; text-align: center;">
        <div style="font-size: 11px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.25em; color: #c8a96e; margin-bottom: 16px; font-family: 'JetBrains Mono', monospace;">
          // DIGITAL DOWNLOAD FILES
        </div>
        <p style="font-size: 12px; line-height: 1.6; color: #8a8377; margin: 0 0 20px 0; font-family: 'Space Grotesk', sans-serif;">
          Click below to access your embroidery files via Google Drive folder.
        </p>
        ${downloadRows}
      </div>
    `;
  }

  const itemsHtml = order.items
    .map((item) => {
      const qty = item.quantity || item.qty || 1;
      const imgUrl = item.image || '';
      
      const imgHtml = `<td style="padding: 16px 0; border-bottom: 1px solid #1c1c1e; width: 64px; vertical-align: top;">
        <div style="width: 50px; height: 65px; background-color: #0f0f11; border: 1px solid #27272a; overflow: hidden; display: block; text-align: center;">
          ${imgUrl 
            ? `<img src="${imgUrl}" alt="${item.name}" style="width: 50px; height: 65px; object-fit: cover; display: block;" />`
            : `<div style="padding-top: 24px; font-size: 8px; color: #3f3f46; font-family: 'JetBrains Mono', monospace; font-weight: bold;">ZW</div>`
          }
        </div>
      </td>`;

      return `
        <tr>
          ${imgHtml}
          <td style="padding: 16px 12px; border-bottom: 1px solid #1c1c1e; text-align: left; vertical-align: top;">
            <div style="font-size: 13px; font-weight: bold; color: #ffffff; font-family: 'Space Grotesk', sans-serif; text-transform: uppercase; letter-spacing: 0.05em;">${item.name}</div>
            <div style="font-size: 11px; color: #71717a; margin-top: 4px; font-family: 'JetBrains Mono', monospace; text-transform: uppercase;">SIZE: ${item.size} &middot; COLOR: ${item.color}</div>
          </td>
          <td style="padding: 16px 12px; border-bottom: 1px solid #1c1c1e; text-align: center; vertical-align: top; font-size: 13px; color: #a1a1aa; font-family: 'JetBrains Mono', monospace;">
            x${qty}
          </td>
          <td style="padding: 16px 0; border-bottom: 1px solid #1c1c1e; text-align: right; vertical-align: top; font-size: 13px; color: #ffffff; font-weight: bold; font-family: 'Space Grotesk', sans-serif;">
            ${formatPrice(item.price * qty)}
          </td>
        </tr>
      `;
    })
    .join('');

  const shippingCost = order.shippingCost || 0;
  const subtotal = order.totalAmount - shippingCost;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation | ZOWEAR</title>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@400;700;800&display=swap" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #050505;
          color: #ffffff;
          font-family: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        @media only screen and (max-width: 600px) {
          .columns-container {
            display: block !important;
          }
          .column {
            width: 100% !important;
            margin-bottom: 24px !important;
            padding-right: 0 !important;
            padding-left: 0 !important;
          }
        }
      </style>
    </head>
    <body style="background-color: #050505; padding: 20px 0;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #000000; border: 1px solid #1c1c1e; overflow: hidden; padding: 0;">
        
        <!-- Header Banner -->
        <div style="border-bottom: 1px solid #1c1c1e; padding: 30px 20px; text-align: center;">
          <div style="font-size: 24px; font-weight: 800; letter-spacing: 0.5em; text-transform: uppercase; color: #ffffff; margin: 0; font-family: 'Space Grotesk', sans-serif;">ZOWEAR</div>
          <div style="font-size: 9px; font-weight: bold; letter-spacing: 0.3em; text-transform: uppercase; color: #ef4444; margin-top: 6px; font-family: 'Space Grotesk', sans-serif;">COLLECTIVE</div>
        </div>

        <div style="padding: 40px 24px;">
          <!-- Hero Announcement -->
          <div style="text-align: center; margin-bottom: 32px;">
            <div style="display: inline-block; background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 8px 16px; font-size: 9px; font-weight: bold; color: #ef4444; text-transform: uppercase; letter-spacing: 0.2em; font-family: 'JetBrains Mono', monospace; margin-bottom: 20px;">
              REGISTRY SECURED
            </div>
            <h1 style="font-size: 32px; font-weight: 800; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: -0.03em; color: #ffffff; line-height: 1.1; font-family: 'Space Grotesk', sans-serif;">
              SILHOUETTE CONFIRMED
            </h1>
            <p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; max-width: 460px; margin: 0 auto; font-family: 'Space Grotesk', sans-serif;">
              Thank you, ${order.shippingAddress.firstName}. Your selection from the ZOWEAR Silhouette line has been confirmed and queue-marked for artisan assembly.
            </p>
          </div>

          ${digitalDownloadsHtml}

          <!-- Streetwear-Style Order Progress Tracker -->
          <div style="text-align: center; margin: 40px 0; font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.1em; color: #71717a; background-color: #070708; border: 1px solid #1c1c1e; padding: 16px 8px;">
            <span style="color: #ef4444; font-weight: bold;">[● PLACED]</span>
            <span style="color: #27272a;">━━━</span>
            <span>[○ PROCESSING]</span>
            <span style="color: #27272a;">━━━</span>
            <span>[○ SHIPPED]</span>
            <span style="color: #27272a;">━━━</span>
            <span>[○ DELIVERED]</span>
          </div>

          <!-- Technical Spec Card (Metadata) -->
          <div style="background-color: #08080a; border: 1px solid #1c1c1e; padding: 24px; margin-bottom: 40px; position: relative;">
            <table style="width: 100%; border-spacing: 0; font-family: 'JetBrains Mono', monospace; font-size: 11px;">
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em;">Order ID</td>
                <td style="padding: 6px 0; text-align: right; color: #ffffff;">${order._id || 'PENDING'}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em;">Date Added</td>
                <td style="padding: 6px 0; text-align: right; color: #ffffff;">${new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em;">Payment Method</td>
                <td style="padding: 6px 0; text-align: right; color: #ffffff; text-transform: uppercase;">${order.paymentMethod}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; font-weight: bold; color: #71717a; text-transform: uppercase; letter-spacing: 0.1em;">Registry Status</td>
                <td style="padding: 6px 0; text-align: right; color: #ef4444; font-weight: bold; text-transform: uppercase;">${order.status}</td>
              </tr>
            </table>

            <!-- Brutalist Barcode Graphic -->
            <div style="border-top: 1px dashed #1c1c1e; margin-top: 20px; padding-top: 20px; text-align: center;">
              <div style="font-family: 'JetBrains Mono', monospace; font-size: 15px; letter-spacing: -1px; color: #3f3f46; margin-bottom: 4px; user-select: none;">
                ||||| |||| || |||||| | ||||| || |||||||| |||| | |||| ||||||
              </div>
              <div style="font-family: 'JetBrains Mono', monospace; font-size: 8px; color: #71717a; letter-spacing: 3px; text-transform: uppercase;">
                *${order._id || 'PENDING'}*
              </div>
            </div>
          </div>

          <!-- Items Breakdown -->
          <div style="margin-bottom: 40px;">
            <div style="font-size: 10px; font-weight: bold; uppercase; letter-spacing: 0.25em; color: #ef4444; margin-bottom: 16px; font-family: 'JetBrains Mono', monospace;">
              // SILHOUETTE BREAKDOWN
            </div>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #27272a;">
                  <th colspan="2" style="padding: 8px 0; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; font-family: 'JetBrains Mono', monospace;">Item</th>
                  <th style="padding: 8px 12px; text-align: center; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; font-family: 'JetBrains Mono', monospace; width: 10%;">Qty</th>
                  <th style="padding: 8px 0; text-align: right; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #71717a; font-family: 'JetBrains Mono', monospace; width: 25%;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
          </div>

          <!-- Address and Payment Columns -->
          <div class="columns-container" style="display: table; width: 100%; margin-bottom: 40px; border-spacing: 0;">
            <div class="column" style="display: table-cell; width: 50%; vertical-align: top; padding-right: 16px;">
              <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em; color: #ef4444; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
                [DELIVERY DESTINATION]
              </div>
              <div style="font-size: 13px; line-height: 1.6; color: #a1a1aa; font-family: 'Space Grotesk', sans-serif;">
                <strong style="color: #ffffff;">${order.shippingAddress.firstName} ${order.shippingAddress.lastName}</strong><br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zip}<br>
                <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px;">TEL: ${order.shippingAddress.phone}</span>
              </div>
            </div>
            <div class="column" style="display: table-cell; width: 50%; vertical-align: top; padding-left: 16px; border-left: 1px solid #1c1c1e;">
              <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em; color: #ef4444; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
                [SHIPPING METHOD]
              </div>
              <div style="font-size: 13px; color: #ffffff; font-family: 'Space Grotesk', sans-serif; font-weight: bold; text-transform: uppercase; margin-bottom: 20px;">
                ${order.shippingMethod || 'Standard Delivery'}
              </div>
              <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.2em; color: #ef4444; margin-bottom: 12px; font-family: 'JetBrains Mono', monospace;">
                [PAYMENT RESOLUTION]
              </div>
              <div style="font-size: 13px; color: #ffffff; font-family: 'Space Grotesk', sans-serif; font-weight: bold; text-transform: uppercase;">
                ${order.paymentMethod}
              </div>
            </div>
          </div>

          <!-- Cost Summary Table -->
          <div style="border-top: 1px solid #1c1c1e; padding-top: 24px;">
            <table style="width: 100%; border-spacing: 0; font-size: 13px; color: #a1a1aa; font-family: 'Space Grotesk', sans-serif;">
              <tr>
                <td style="padding: 6px 0; text-align: left;">Silhouette Subtotal</td>
                <td style="padding: 6px 0; text-align: right; color: #ffffff;">${formatPrice(subtotal)}</td>
              </tr>
              <tr>
                <td style="padding: 6px 0; text-align: left;">Artisanal Delivery Fee</td>
                <td style="padding: 6px 0; text-align: right; color: #ef4444;">
                  ${shippingCost === 0 ? 'COMPLIMENTARY' : formatPrice(shippingCost)}
                </td>
              </tr>
              <tr style="font-weight: bold; font-size: 16px; color: #ffffff;">
                <td style="padding: 16px 0 0 0; text-align: left; border-top: 1px solid #1c1c1e; text-transform: uppercase; letter-spacing: 0.05em; font-family: 'Space Grotesk', sans-serif;">Registry Grand Total</td>
                <td style="padding: 16px 0 0 0; text-align: right; color: #ef4444; border-top: 1px solid #1c1c1e; font-size: 20px; font-family: 'Space Grotesk', sans-serif;">
                  ${formatPrice(order.totalAmount)}
                </td>
              </tr>
            </table>
          </div>

          <!-- Quality statement card -->
          <div style="margin-top: 40px; background-color: #08080a; border: 1px solid #1c1c1e; padding: 20px; font-family: 'Space Grotesk', sans-serif; font-size: 12px; color: #71717a; line-height: 1.5;">
            <strong style="color: #ffffff; display: block; margin-bottom: 6px; text-transform: uppercase; font-size: 10px; letter-spacing: 0.1em; font-family: 'JetBrains Mono', monospace; color: #ef4444;">// ARTISANAL COMPLIANCE NOTICE</strong>
            All items marked ZOWEAR are developed under premium standards using carefully selected fabrics. Please allow 1-2 business days for silhouette processing prior to courier dispatch.
          </div>

        </div>

        <!-- Footer -->
        <div style="background-color: #08080a; border-top: 1px solid #1c1c1e; padding: 40px 24px; text-align: center; font-family: 'JetBrains Mono', monospace; font-size: 10px; color: #52525b;">
          <div style="font-size: 13px; font-weight: 800; letter-spacing: 0.3em; text-transform: uppercase; color: #a1a1aa; margin-bottom: 20px;">ZOWEAR</div>
          <p style="line-height: 1.6; margin-bottom: 24px; max-width: 400px; margin-left: auto; margin-right: auto;">
            This is a system-generated cryptographic email confirming order registry entry. Please do not reply directly to this transmission.
          </p>
          <div style="margin-bottom: 24px;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/returns" style="color: #a1a1aa; text-decoration: none; margin: 0 10px; text-transform: uppercase; letter-spacing: 0.15em;">Return Policy</a> &middot;
            <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/privacy-terms" style="color: #a1a1aa; text-decoration: none; margin: 0 10px; text-transform: uppercase; letter-spacing: 0.15em;">Support Desk</a>
          </div>
          <div style="margin-top: 20px; font-size: 9px; color: #3f3f46; text-transform: uppercase;">
            &copy; ${new Date().getFullYear()} ZOWEARS COLLECTIVE. ALL RIGHTS RESERVED.
          </div>
        </div>

      </div>
    </body>
    </html>
  `;
}
