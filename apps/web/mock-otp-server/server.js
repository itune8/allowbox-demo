import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

// In-memory OTP store for demo only
const store = new Map(); // email -> { otp, expiresAt }

const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

app.post('/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: 'Email is required' });

  const otp = generateOtp();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
  store.set(email, { otp, expiresAt });
  console.log(`[mock-otp] sending OTP ${otp} to ${email}`);

  return res.json({ success: true });
});

app.post('/auth/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  const record = store.get(email);
  if (!record) return res.status(400).json({ message: 'OTP not requested' });
  if (Date.now() > record.expiresAt) return res.status(400).json({ message: 'OTP expired' });
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  return res.json({ success: true });
});

app.post('/auth/reset-password', (req, res) => {
  const { email, otp, password } = req.body;
  const record = store.get(email);
  if (!record) return res.status(400).json({ message: 'OTP not requested' });
  if (Date.now() > record.expiresAt) return res.status(400).json({ message: 'OTP expired' });
  if (record.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });
  if (!password || password.length < 6) return res.status(400).json({ message: 'Weak password' });

  // Mock: consider password updated
  store.delete(email);
  return res.json({ success: true });
});

const PORT = process.env.PORT || 5055;
app.listen(PORT, () => console.log(`[mock-otp] listening on http://localhost:${PORT}`));
