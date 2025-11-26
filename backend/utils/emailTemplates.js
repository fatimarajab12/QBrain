export const EmailTemplates = {
  VERIFICATION: 'verification',
  WELCOME: 'welcome',
  RESET_CODE: 'reset_code',
};

export const getTemplate = (type, data) => {
  const templates = {
    [EmailTemplates.VERIFICATION]: {
      subject: 'Verify Your QBrain Account',
      html: verificationTemplate(data)
    },
    [EmailTemplates.WELCOME]: {
      subject: 'Welcome to QBrain! Your Account is Active',
      html: welcomeTemplate(data)
    },
     [EmailTemplates.RESET_CODE]: {
      subject: 'Your QBrain Password Reset Code',
      html: resetCodeTemplate(data)
    }
  };

  return templates[type] || null;
};

const verificationTemplate = ({ userName, verificationLink, verificationToken }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>/* Your verification template styles */</style>
</head>
<body>
  <div class="container">
    <h1>Verify Your Account</h1>
    <p>Hello ${userName},</p>
    <a href="${verificationLink}" class="button">Verify Email</a>
  </div>
</body>
</html>
`;

const welcomeTemplate = ({ userName }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>/* Your welcome template styles */</style>
</head>
<body>
  <div class="container">
    <h1>Welcome ${userName}!</h1>
    <p>Your account is now active.</p>
  </div>
</body>
</html>
`;

const resetCodeTemplate = ({ userName, code }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    /* Add your styles */
  </style>
</head>
<body>
  <div class="container">
    <h1>Password Reset Request</h1>
    <p>Hello ${userName},</p>
    <p>Your 4-digit reset code is:</p>

    <h2 style="font-size: 28px; letter-spacing: 4px;">${code}</h2>

    <p>This code will expire in 10 minutes.</p>
  </div>
</body>
</html>
`;