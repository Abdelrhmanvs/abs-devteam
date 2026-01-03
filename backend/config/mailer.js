const nodemailer = require("nodemailer");

// Create reusable transporter object using Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASSWORD, // Your Gmail App Password
    },
  });
};

// Send email with credentials to new user
const sendCredentialsEmail = async (recipientEmail, password, employeeData) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.COMPANY_NAME || "ABS Company"}" <${
        process.env.EMAIL_USER
      }>`,
      to: recipientEmail,
      subject: "Your Account Credentials - Welcome!",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #EA8303; color: white; padding: 20px; text-align: center; }
            .content { background-color: #f9f9f9; padding: 20px; border: 1px solid #ddd; }
            .credentials { background-color: #fff; padding: 15px; margin: 15px 0; border-left: 4px solid #EA8303; }
            .credential-item { margin: 10px 0; }
            .credential-label { font-weight: bold; color: #555; }
            .credential-value { color: #000; font-family: 'Courier New', monospace; background-color: #f5f5f5; padding: 5px 10px; border-radius: 3px; }
            .footer { text-align: center; margin-top: 20px; color: #777; font-size: 12px; }
            .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 10px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to ${process.env.COMPANY_NAME || "ABS Company"}!</h1>
            </div>
            <div class="content">
              <p>Dear <strong>${employeeData.fullName}</strong>,</p>
              
              <p>Your account has been successfully created. Below are your login credentials:</p>
              
              <div class="credentials">
                <div class="credential-item">
                  <span class="credential-label">Email:</span><br/>
                  <span class="credential-value">${recipientEmail}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">Password:</span><br/>
                  <span class="credential-value">${password}</span>
                </div>
                <div class="credential-item">
                  <span class="credential-label">Employee Code:</span><br/>
                  <span class="credential-value">${
                    employeeData.employeeCode
                  }</span>
                </div>
              </div>
              
              <div class="warning">
                <strong>⚠️ Important Security Notice:</strong>
                <p>Please change your password after your first login. Keep your credentials secure and do not share them with anyone.</p>
              </div>
              
              <p>If you have any questions or need assistance, please contact your administrator.</p>
              
              <p>Best regards,<br/><strong>${
                process.env.COMPANY_NAME || "ABS Company"
              } Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} ${
        process.env.COMPANY_NAME || "ABS Company"
      }. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Welcome to ${process.env.COMPANY_NAME || "ABS Company"}!

Dear ${employeeData.fullName},

Your account has been successfully created. Below are your login credentials:

Email: ${recipientEmail}
Password: ${password}
Employee Code: ${employeeData.employeeCode}

IMPORTANT SECURITY NOTICE:
Please change your password after your first login. Keep your credentials secure and do not share them with anyone.

If you have any questions or need assistance, please contact your administrator.

Best regards,
${process.env.COMPANY_NAME || "ABS Company"} Team

---
This is an automated message, please do not reply to this email.
© ${new Date().getFullYear()} ${
        process.env.COMPANY_NAME || "ABS Company"
      }. All rights reserved.
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendCredentialsEmail,
};
