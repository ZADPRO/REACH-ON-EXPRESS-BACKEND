export const generateSignupEmailContent = (
  username: string,
  password: string
) => {
  return `
      <h3>Welcome to Our Platform!</h3>
      <p>Dear User,</p>
      <p>Your account has been successfully created. Below are your login details:</p>
      <ul>
        <li><strong>Email:</strong> ${username}</li>
        <li><strong>Password:</strong> ${password}</li>
      </ul>
      <p>Please log in and change your password for security reasons.</p>
      <p>Best Regards,<br/>The Team</p>
    `;
};

export const generateCustomerWelcomeEmailContent = (
  username: string,
  password: string
) => {
  return `
    <h3>Welcome to Our Platform!</h3>
    <p>Dear Customer,</p>
    <p>We're excited to have you on board. Your account has been successfully created. Please find your login credentials below:</p>
    <ul>
      <li><strong>Username:</strong> ${username}</li>
      <li><strong>Password:</strong> ${password}</li>
    </ul>
    <p>If you have any questions or need assistance, feel free to contact our support team.</p>
    <p>Warm regards,<br/>The Customer Support Team</p>
  `;
};
