import nodemailer from 'nodemailer';

export async function POST(request) {
  try {
    const { name, email, subject, message } = await request.json();

    // Basic validation
    if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
      return Response.json({ success: false, error: 'All fields are required.' }, { status: 400 });
    }

    // Build transporter using Gmail SMTP (same creds as backend)
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const subjectLabel = {
      order: 'Order Support',
      product: 'Product Information',
      press: 'Press & Collaboration',
      other: 'Other',
    }[subject] || subject;

    const htmlBody = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Contact Message – Zowear</title>
      </head>
      <body style="margin:0;padding:0;background-color:#050505;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:600px;margin:0 auto;background:#000;border:1px solid #1c1c1e;overflow:hidden;">

          <!-- Header -->
          <div style="background:#080808;border-bottom:1px solid #1c1c1e;padding:28px 24px;text-align:center;">
            <div style="font-size:22px;font-weight:800;letter-spacing:0.5em;text-transform:uppercase;color:#fff;">ZOWEAR</div>
            <div style="font-size:9px;font-weight:bold;letter-spacing:0.3em;text-transform:uppercase;color:#ef4444;margin-top:4px;">COLLECTIVE · CONTACT FORM</div>
          </div>

          <!-- Body -->
          <div style="padding:40px 32px;">
            <div style="display:inline-block;background:rgba(239,68,68,0.1);border:1px solid rgba(239,68,68,0.25);padding:6px 16px;font-size:9px;font-weight:bold;color:#ef4444;text-transform:uppercase;letter-spacing:0.2em;margin-bottom:28px;">
              NEW INCOMING MESSAGE
            </div>

            <table style="width:100%;border-collapse:collapse;font-size:13px;font-family:'Segoe UI',sans-serif;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1c1c1e;color:#71717a;width:120px;font-weight:bold;text-transform:uppercase;font-size:10px;letter-spacing:0.15em;">From</td>
                <td style="padding:10px 0;border-bottom:1px solid #1c1c1e;color:#fff;font-weight:600;">${name}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1c1c1e;color:#71717a;font-weight:bold;text-transform:uppercase;font-size:10px;letter-spacing:0.15em;">Email</td>
                <td style="padding:10px 0;border-bottom:1px solid #1c1c1e;color:#a1a1aa;">
                  <a href="mailto:${email}" style="color:#ef4444;text-decoration:none;">${email}</a>
                </td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid #1c1c1e;color:#71717a;font-weight:bold;text-transform:uppercase;font-size:10px;letter-spacing:0.15em;">Category</td>
                <td style="padding:10px 0;border-bottom:1px solid #1c1c1e;color:#fff;">${subjectLabel}</td>
              </tr>
            </table>

            <!-- Message Block -->
            <div style="margin-top:32px;">
              <div style="font-size:10px;font-weight:bold;text-transform:uppercase;letter-spacing:0.2em;color:#ef4444;margin-bottom:12px;">// MESSAGE</div>
              <div style="background:#08080a;border:1px solid #1c1c1e;border-left:3px solid #ef4444;padding:20px 24px;font-size:14px;line-height:1.7;color:#d4d4d8;white-space:pre-wrap;">${message.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>

            <!-- Reply CTA -->
            <div style="margin-top:32px;text-align:center;">
              <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subjectLabel)} – Zowear"
                 style="display:inline-block;background:#ef4444;color:#fff;text-decoration:none;padding:14px 32px;font-size:11px;font-weight:bold;text-transform:uppercase;letter-spacing:0.2em;">
                REPLY TO ${name.toUpperCase()}
              </a>
            </div>
          </div>

          <!-- Footer -->
          <div style="background:#08080a;border-top:1px solid #1c1c1e;padding:24px;text-align:center;font-size:10px;color:#52525b;letter-spacing:0.1em;text-transform:uppercase;">
            © ${new Date().getFullYear()} ZOWEARS COLLECTIVE · Karachi, Pakistan
          </div>
        </div>
      </body>
      </html>
    `;

    await transporter.sendMail({
      from: process.env.SMTP_FROM || `Zowear Contact <${process.env.SMTP_USER}>`,
      to: 'wm66179@gmail.com',
      replyTo: `${name} <${email}>`,
      subject: `[Zowear Contact] ${subjectLabel} – from ${name}`,
      html: htmlBody,
    });

    console.log(`[Contact] Message from ${name} <${email}> (${subjectLabel}) forwarded to wm66179@gmail.com`);
    return Response.json({ success: true });

  } catch (error) {
    console.error('[Contact] Failed to send contact email:', error);
    return Response.json({ success: false, error: 'Failed to send message. Please try again.' }, { status: 500 });
  }
}
