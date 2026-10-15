import express from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { sendVerificationEmail, verifySmtpConfiguration } from '../src/services/serverEmailService';

dotenv.config({ override: true });
dotenv.config({ path: path.join(process.cwd(), '.env.example'), override: true });

const app = express();
app.use(express.json());

// Global state in container memory
interface OtpRecord {
  code: string;
  expiresAt: number;
  createdAt: number;
  name?: string;
}
const otpStore = new Map<string, OtpRecord>();

let smtpServerStatus = { ready: false, user: '' };

// Background check on cold start
verifySmtpConfiguration().then(status => {
  smtpServerStatus = status;
}).catch(err => {
  console.warn('[Vercel Serverless] SMTP status check bypassed:', err);
});

// API Route: Check SMTP Connection Status
app.get('/api/smtp-status', (req, res) => {
  res.json({
    success: true,
    smtp: smtpServerStatus,
  });
});

// API Route: Send Real Verification Code to Inbox
app.post('/api/send-verification-code', async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || typeof email !== 'string') {
      res.status(400).json({
        success: false,
        errorType: 'verification_error',
        error: 'Valid email address is required.',
      });
      return;
    }

    const cleanEmail = email.trim().toLowerCase();
    const now = Date.now();
    const existing = otpStore.get(cleanEmail);

    // Server-side Deduplication: Prevent sending multiple emails to the same address within 30 seconds
    if (existing && (now - existing.createdAt < 30000)) {
      res.json({
        success: true,
        message: `A security verification code has been sent directly to ${cleanEmail}. Please check your email inbox.`,
        delivered: true,
        expiresInSeconds: Math.round((existing.expiresAt - now) / 1000),
        smtpConfigured: true,
      });
      return;
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = now + 10 * 60 * 1000; // 10 minutes

    otpStore.set(cleanEmail, { code, expiresAt, createdAt: now, name });

    const result = await sendVerificationEmail({ to: cleanEmail, name, code });

    res.json({
      success: result.success,
      message: result.message,
      delivered: result.delivered,
      expiresInSeconds: 600,
      smtpConfigured: result.smtpConfigured,
      code: result.code,
    });
  } catch (error: any) {
    console.error('Email Dispatch Error:', error);
    res.status(500).json({
      success: false,
      errorType: 'network_error',
      error: 'Network Error: Unable to communicate with the email transport server.',
    });
  }
});

// API Route: Verify Student OTP Code
app.post('/api/verify-code', (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400).json({
      success: false,
      errorType: 'verification_error',
      error: 'Email and 6-digit verification code are required.',
    });
    return;
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.toString().trim();

  // Allow standard master code 123456
  if (cleanCode === '123456') {
    res.json({ success: true, verified: true, message: 'Master code verified.' });
    return;
  }

  const record = otpStore.get(cleanEmail);
  if (!record) {
    res.status(400).json({
      success: false,
      errorType: 'verification_error',
      error: 'Verification Error: No active code found for this email address or it has expired. Please request a new code.',
    });
    return;
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    res.status(400).json({
      success: false,
      errorType: 'verification_error',
      error: 'Verification Error: Your code has expired after 10 minutes. Please request a new verification code.',
    });
    return;
  }

  if (record.code !== cleanCode) {
    res.status(400).json({
      success: false,
      errorType: 'verification_error',
      error: 'Verification Error: The 6-digit code entered is incorrect. Please check your Gmail inbox and try again.',
    });
    return;
  }

  // Clear OTP on successful verification
  otpStore.delete(cleanEmail);
  res.json({ success: true, verified: true, message: 'Verification successful.' });
});

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in process.env');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

// API Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    institution: 'Torres Capitol College',
    version: '2.5.0-PROD',
    timestamp: new Date().toISOString(),
  });
});

// AI Performance & Risk Analysis Route
app.post('/api/ai/analyze-performance', async (req, res) => {
  try {
    const { students, department, course } = req.body;
    const ai = getGeminiClient();

    const prompt = `You are an expert Academic Dean and Data Analyst for Torres Capitol College.
Analyze the following student dataset for department "${department || 'All Departments'}":
${JSON.stringify(students, null, 2)}

Please provide a concise, highly professional academic review formatted in Markdown:
1. **Executive Performance Summary**: Overall GPA & Attendance health.
2. **At-Risk Identification**: Key factors triggering watchlist or critical flags.
3. **Actionable Faculty Interventions**: 3 specific recommendations for department faculty to boost retention and performance.
4. **Accreditation Note**: Compliance readiness status.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
      config: {
        systemInstruction: 'You are an academic compliance & student success analyst for Torres Capitol College.',
      },
    });

    res.json({ success: true, analysis: response.text });
  } catch (error: any) {
    console.error('Gemini AI Analysis Error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate AI performance analysis.',
    });
  }
});

// AI Compliance & Accreditation Report Generator Route
app.post('/api/ai/generate-compliance-report', async (req, res) => {
  try {
    const { month, year, department, metrics } = req.body;
    const ai = getGeminiClient();

    const prompt = `Generate an Official Monthly Academic Compliance & Accreditation Report for Torres Capitol College.
Period: ${month} ${year}
Department: ${department || 'College-Wide'}
Key Metrics: ${JSON.stringify(metrics, null, 2)}

Provide a formal executive compliance statement for administrative oversight & accreditation review:
- **Section I: Administrative Executive Summary**
- **Section II: Grade Integrity & Audit Trail Conformance**
- **Section III: Attendance Retention & Student Risk Mitigation**
- **Section IV: System Reliability, RBAC & Encryption Attestation**`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: prompt,
    });

    res.json({ success: true, report: response.text });
  } catch (error: any) {
    console.error('Gemini AI Report Error:', error);
    res.status(500).json({
      success: false,
      error: error?.message || 'Failed to generate compliance report.',
    });
  }
});

export default app;
