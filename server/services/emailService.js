const nodemailer = require("nodemailer");

// Create email transporter
const createTransporter = async () => {
    // If SMTP credentials are provided in .env, use them
    if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: process.env.SMTP_SECURE === "true",
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    // Otherwise, create a reusable Ethereal test account or local logger
    try {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    } catch (err) {
        console.warn("Could not create ethereal email account, falling back to mock sender");
        return null;
    }
};

const sendTeamInvitationEmail = async ({ toEmail, memberName, teamName, leaderName, inviteLink }) => {
    try {
        const transporter = await createTransporter();

        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <style>
                body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #040711; color: #ffffff; margin: 0; padding: 40px 20px; }
                .container { max-width: 560px; margin: 0 auto; background: #0c1222; border: 1px solid #1e293b; border-radius: 16px; padding: 36px; text-align: center; }
                .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background: rgba(0, 240, 255, 0.15); border: 1px solid #00f0ff; color: #00f0ff; font-size: 12px; font-weight: 700; text-transform: uppercase; margin-bottom: 20px; }
                h1 { font-size: 24px; color: #ffffff; margin-bottom: 12px; }
                p { font-size: 15px; color: #94a3b8; line-height: 1.6; margin-bottom: 24px; }
                .team-card { background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 12px; padding: 18px; margin-bottom: 28px; text-align: left; }
                .btn { display: inline-block; background: linear-gradient(135deg, #00f0ff 0%, #7000ff 100%); color: #000000; font-weight: 800; font-size: 16px; text-decoration: none; padding: 14px 32px; border-radius: 10px; box-shadow: 0 0 25px rgba(0, 240, 255, 0.4); }
                .footer { font-size: 12px; color: #64748b; margin-top: 32px; }
            </style>
        </head>
        <body>
            <div class="container">
                <span class="badge">IEEE VTS TECH BID EVENT 2026</span>
                <h1>You're Invited to Join a Team!</h1>
                <p>Hello <strong>${memberName || "Teammate"}</strong>,</p>
                <p><strong>${leaderName}</strong> has invited you to join their official team for the <strong>IEEE VTS Tech Bid & Auction Event 2026</strong>.</p>
                
                <div class="team-card">
                    <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 700;">Team Name</div>
                    <div style="font-size: 20px; font-weight: 800; color: #ffffff; margin-top: 4px;">${teamName}</div>
                    <div style="font-size: 13px; color: #00f0ff; margin-top: 6px;">Team Leader: ${leaderName}</div>
                </div>

                <a href="${inviteLink}" class="btn" target="_blank">Confirm & Join Team →</a>

                <p style="font-size: 13px; color: #64748b; margin-top: 24px;">
                    Or copy and paste this link in your browser:<br>
                    <a href="${inviteLink}" style="color: #00f0ff; word-break: break-all;">${inviteLink}</a>
                </p>

                <div class="footer">
                    © 2026 IEEE Vehicular Technology Society (VTS) Student Branch Chapter.
                </div>
            </div>
        </body>
        </html>
        `;

        if (transporter) {
            const info = await transporter.sendMail({
                from: `"IEEE VTS Tech Bid 2026" <${process.env.SMTP_USER || "noreply@vts.org"}>`,
                to: toEmail,
                subject: `Team Invitation: Join ${teamName} at IEEE VTS Tech Bid 2026`,
                html: htmlContent,
            });

            const previewUrl = nodemailer.getTestMessageUrl(info);
            if (previewUrl) {
                console.log(`📧 Test Email Sent to ${toEmail}. Preview URL: ${previewUrl}`);
            }
            return { success: true, previewUrl };
        } else {
            console.log(`📧 Email link for ${toEmail}: ${inviteLink}`);
            return { success: true, inviteLink };
        }
    } catch (error) {
        console.error(`Failed to send invitation email to ${toEmail}:`, error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendTeamInvitationEmail,
};
