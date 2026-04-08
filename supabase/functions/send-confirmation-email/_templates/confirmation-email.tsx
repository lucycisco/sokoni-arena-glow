// Pure string-based HTML email template (no JSX/React dependency)
export function renderConfirmationEmail(confirmationUrl: string): string {
  const LOGO_URL = "https://yotxgvtqhjonujoiebno.supabase.co/storage/v1/object/public/email-assets/logo.png?v=1";

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="background-color:#f7f9f7;font-family:Arial,sans-serif;padding:20px;margin:0;">
  <div style="max-width:600px;margin:0 auto;background:white;border-radius:8px;overflow:hidden;">
    <div style="background-color:#0a7e3a;color:white;padding:25px 20px;text-align:center;">
      <img src="${LOGO_URL}" alt="SokoniArena Logo" width="80" height="80" style="display:block;margin:0 auto 10px;border-radius:8px;" />
      <p style="font-size:18px;margin:5px 0;color:white;">SokoniArena</p>
      <p style="font-size:14px;opacity:0.9;margin:0;color:white;">Welcome to our community</p>
    </div>
    <div style="padding:30px;">
      <p style="color:#1a3c2a;font-size:20px;margin-top:0;margin-bottom:20px;">Complete Your Signup</p>
      <p style="color:#333;font-size:14px;line-height:1.6;">Hello,</p>
      <p style="color:#333;font-size:14px;line-height:1.6;">You're almost done setting up your SokoniArena profile. Please click below to finish:</p>
      <div style="text-align:center;margin:25px 0;">
        <a href="${confirmationUrl}" style="display:inline-block;background-color:#0da34d;color:white;text-decoration:none;padding:12px 24px;border-radius:6px;font-weight:bold;">Complete Signup</a>
      </div>
      <p style="color:#333;font-size:14px;line-height:1.6;">If the link doesn't work, copy and paste this into your browser:</p>
      <div style="background-color:#f5f5f5;padding:12px;border-radius:4px;margin:15px 0;">
        <p style="font-family:monospace;font-size:13px;word-break:break-all;margin:0;color:#333;">${confirmationUrl}</p>
      </div>
      <hr style="border-color:#eee;margin:25px 0;" />
      <div style="background-color:#f0f8f3;padding:15px;border-radius:6px;margin:20px 0;">
        <p style="font-size:14px;margin:0;color:#333;">Questions? Contact our team for assistance.</p>
      </div>
      <p style="color:#333;font-size:14px;line-height:1.6;">If you didn't request this, you can disregard this message.</p>
      <p style="color:#333;font-size:14px;line-height:1.6;">Sincerely,<br/>SokoniArena</p>
    </div>
    <div style="background-color:#f8fbf9;padding:20px;text-align:center;">
      <p style="color:#666;font-size:14px;margin:5px 0;">© 2026 SokoniArena</p>
      <div style="margin:10px 0;">
        <a href="https://sokoniarena.co.ke" style="color:#0a7e3a;margin:0 10px;text-decoration:none;">Visit Site</a>
        <a href="https://sokoniarena.co.ke/terms" style="color:#0a7e3a;margin:0 10px;text-decoration:none;">Terms</a>
      </div>
      <p style="color:#666;font-size:14px;margin:5px 0;">Nairobi</p>
    </div>
  </div>
</body>
</html>`;
}
