export const generateSignupEmailContent = (username: string, password: string) => {
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
