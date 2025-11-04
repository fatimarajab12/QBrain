export const EmailTemplates = {
  VERIFICATION: 'verification',
  WELCOME: 'welcome',
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

