var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
var import_vite = require("vite");

// src/services/serverEmailService.ts
var import_nodemailer = __toESM(require("nodemailer"), 1);
function getCleanEnv(key, defaultValue) {
  const val = process.env[key];
  if (!val) return defaultValue;
  let clean = val.trim();
  if (clean.startsWith('"') && clean.endsWith('"') || clean.startsWith("'") && clean.endsWith("'")) {
    clean = clean.slice(1, -1);
  }
  return clean.trim();
}
async function getSmtpTransporter() {
  const host = getCleanEnv("SMTP_HOST", "smtp.gmail.com");
  const portStr = getCleanEnv("SMTP_PORT", "587");
  const port = parseInt(portStr, 10);
  const secure = port === 465;
  const user = getCleanEnv("SMTP_USER", "");
  let pass = getCleanEnv("SMTP_PASS", "");
  if (!user || !pass) throw new Error("SMTP_USER and SMTP_PASS must be configured");
  pass = pass.replace(/\s+/g, "");
  console.info(`[SMTP] Initializing transporter: ${host}:${port} (secure: ${secure}, user: ${user})`);
  return import_nodemailer.default.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: "TLSv1.2"
    },
    connectionTimeout: 4e3,
    // 4s timeout prevents Vercel from timing out on blocked ports
    greetingTimeout: 3e3,
    // 3s greeting timeout
    socketTimeout: 5e3
    // 5s socket inactivity timeout
  });
}
async function verifySmtpConfiguration() {
  const user = getCleanEnv("SMTP_USER", "");
  const resendApiKey = getCleanEnv("RESEND_API_KEY", "");
  if (resendApiKey && resendApiKey !== "MY_RESEND_API_KEY") {
    console.info("\u2705 [Resend Web API Configured] High-priority HTTPS email delivery is active.");
    return { ready: true, user: "Resend API Mode" };
  }
  if (!user || !getCleanEnv("SMTP_PASS", "")) {
    return { ready: false, user, error: "Email credentials are not configured." };
  }
  try {
    const transporter = await getSmtpTransporter();
    await transporter.verify();
    console.info(`\u2705 [SMTP CONFIG VERIFIED] Successfully connected to Gmail SMTP server (${user}).`);
    return { ready: true, user };
  } catch (err) {
    console.info(`\u2139\uFE0F [SMTP Status] Email delivery is unavailable for ${user}. (${err?.message || err})`);
    return { ready: false, user, error: "Email delivery is unavailable." };
  }
}
async function sendVerificationEmail({ to, name, code }) {
  const cleanEmail = to.trim().toLowerCase();
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
      <div style="background-color: #1e3a8a; padding: 24px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 0.5px;">TORRES CAPITOL COLLEGE</h1>
        <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.8; font-weight: 600;">STUDENT INFORMATION SYSTEM &bull; REGISTRATION VERIFICATION</p>
      </div>
      
      <h2 style="color: #0f172a; font-size: 18px; margin-bottom: 12px;">Dear ${name || "Student"},</h2>
      <p style="color: #475569; font-size: 14px; line-height: 1.6; margin-bottom: 24px;">
        You are attempting to register or log in to the Torres Capitol College Student Portal. Please use the authentic 6-digit verification code below to verify your email address.
      </p>

      <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
        <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1px; margin-bottom: 8px;">Your 6-Digit Verification Code</div>
        <div style="font-size: 36px; font-weight: 900; font-family: monospace; letter-spacing: 10px; color: #2563eb;">${code}</div>
        <div style="font-size: 12px; color: #64748b; margin-top: 10px;">This code expires in 10 minutes.</div>
      </div>

      <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-bottom: 24px;">
        If you did not initiate this registration request, please disregard this email.
      </p>

      <hr style="border: none; border-top: 1px solid #e2e8f0; margin-bottom: 16px;" />
      <div style="text-align: center; font-size: 11px; color: #94a3b8;">
        &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Torres Capitol College Office of Admissions & IT Services.<br />
        ISO 27001 Certified &bull; Data Privacy Act Compliant
      </div>
    </div>
  `;
  const resendApiKey = getCleanEnv("RESEND_API_KEY", "");
  let resendErrorDetail = "";
  if (resendApiKey && resendApiKey !== "MY_RESEND_API_KEY") {
    try {
      console.info(`[Resend Web API] Initiating secure HTTPS dispatch to ${cleanEmail}...`);
      let fromEmail = getCleanEnv("RESEND_FROM", "");
      if (!fromEmail) {
        const smtpFrom = getCleanEnv("SMTP_FROM", "onboarding@resend.dev");
        if (smtpFrom.includes("@gmail.com") || smtpFrom.includes("@yahoo.") || smtpFrom.includes("@hotmail.") || smtpFrom.includes("@outlook.")) {
          fromEmail = "onboarding@resend.dev";
        } else {
          fromEmail = smtpFrom;
        }
      }
      if (!fromEmail.includes("<")) {
        fromEmail = `"Torres Capitol College" <${fromEmail}>`;
      }
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [cleanEmail],
          subject: `[TCC Security] ${code} is your verification code`,
          html: htmlBody
        })
      });
      if (res.ok) {
        const data = await res.json();
        console.info("[Resend Web API] Success! Email dispatched via Resend REST API:", data);
        return {
          success: true,
          message: `A security verification code has been sent directly to ${cleanEmail}. Please check your email inbox.`,
          delivered: true,
          smtpConfigured: true,
          code
        };
      } else {
        const errorText = await res.text();
        console.warn("[Resend Web API] Request rejected:", errorText);
        try {
          const parsed = JSON.parse(errorText);
          resendErrorDetail = parsed.message || parsed.error || errorText;
        } catch (_) {
          resendErrorDetail = errorText;
        }
      }
    } catch (resendErr) {
      console.warn("[Resend Web API] Request threw exception:", resendErr?.message || resendErr);
      resendErrorDetail = resendErr?.message || "Connection to Resend failed";
    }
  }
  try {
    const transporter = await getSmtpTransporter();
    if (!transporter) {
      return {
        success: false,
        message: resendErrorDetail ? `[Resend Error] ${resendErrorDetail}. Please verify your Resend dashboard settings.` : "Email delivery is not configured. Contact the system administrator.",
        delivered: false,
        smtpConfigured: false,
        code
      };
    }
    const smtpUser = getCleanEnv("SMTP_USER", "");
    const fromAddress = getCleanEnv("SMTP_FROM", `"Torres Capitol College" <${smtpUser}>`);
    try {
      await transporter.sendMail({
        from: fromAddress,
        to: cleanEmail,
        subject: `[TCC Security] ${code} is your verification code`,
        html: htmlBody
      });
      console.info(`Direct SMTP message successfully sent to ${cleanEmail}`);
      return {
        success: true,
        message: `A security verification code has been sent directly to ${cleanEmail}. Please check your email inbox.`,
        delivered: true,
        smtpConfigured: true,
        code
      };
    } catch (sendErr) {
      console.info("SMTP sendMail failed. (" + (sendErr?.message || sendErr) + ")");
      const failureMessage = resendErrorDetail ? `[Resend Error] ${resendErrorDetail}. Please verify your Resend settings.` : "Email delivery failed. Please try again later or contact the system administrator.";
      return {
        success: false,
        message: failureMessage,
        delivered: false,
        smtpConfigured: true,
        code,
        error: sendErr?.message
      };
    }
  } catch (error) {
    console.info("SMTP Email Service Dispatch failed. (" + (error?.message || "SMTP dispatch failed") + ")");
    const failureMessage = resendErrorDetail ? `[Resend Error] ${resendErrorDetail}. Please verify your Resend settings.` : "Email delivery failed. Please try again later or contact the system administrator.";
    return {
      success: false,
      message: failureMessage,
      delivered: false,
      smtpConfigured: false,
      code,
      error: error?.message || "SMTP dispatch failed"
    };
  }
}

// src/services/sharedAppState.ts
var import_serverless = require("@neondatabase/serverless");
var schemaReady = null;
function getDatabase() {
  const connectionString = process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.NEON_DATABASE_URL;
  if (!connectionString) throw new Error("Set DATABASE_URL_POOLED or DATABASE_URL in the Vercel environment.");
  return (0, import_serverless.neon)(connectionString);
}
async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const sql = getDatabase();
      await sql`
        CREATE TABLE IF NOT EXISTS tcc_app_state (
          state_id TEXT PRIMARY KEY,
          payload JSONB NOT NULL,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
    })().catch((error) => {
      schemaReady = null;
      throw error;
    });
  }
  await schemaReady;
}
async function readSharedAppState() {
  await ensureSchema();
  const sql = getDatabase();
  const rows = await sql`
    SELECT payload, updated_at
    FROM tcc_app_state
    WHERE state_id = 'main'
    LIMIT 1
  `;
  if (!rows.length) return null;
  return {
    state: rows[0].payload,
    updatedAt: new Date(rows[0].updated_at).toISOString()
  };
}
async function writeSharedAppState(state) {
  await ensureSchema();
  const sql = getDatabase();
  const rows = await sql`
    INSERT INTO tcc_app_state (state_id, payload, updated_at)
    VALUES ('main', ${JSON.stringify(state)}::jsonb, NOW())
    ON CONFLICT (state_id)
    DO UPDATE SET payload = EXCLUDED.payload, updated_at = NOW()
    RETURNING updated_at
  `;
  return new Date(rows[0].updated_at).toISOString();
}

// src/services/sharedAppStateApi.ts
function registerSharedAppStateApi(app2) {
  app2.use("/api", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, PUT, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }
    next();
  });
  app2.get("/api/app-state", async (_req, res) => {
    try {
      const shared = await readSharedAppState();
      res.setHeader("Cache-Control", "no-store");
      res.json(shared);
    } catch (error) {
      console.error("Shared state read failed:", error);
      res.status(503).json({ error: "Shared database is unavailable." });
    }
  });
  app2.put("/api/app-state", async (req, res) => {
    const state = req.body;
    if (!state || typeof state !== "object" || Array.isArray(state)) {
      res.status(400).json({ error: "A valid app state object is required." });
      return;
    }
    try {
      const updatedAt = await writeSharedAppState(state);
      res.setHeader("Cache-Control", "no-store");
      res.json({ updatedAt });
    } catch (error) {
      console.error("Shared state write failed:", error);
      res.status(503).json({ error: "Shared database is unavailable." });
    }
  });
}

// server.ts
import_dotenv.default.config({ path: [".env.local", ".env"], override: false });
import_dotenv.default.config({ path: import_path.default.join(process.cwd(), ".env.example"), override: false });
var app = (0, import_express.default)();
var PORT = 3e3;
app.use(import_express.default.json({ limit: "10mb" }));
registerSharedAppStateApi(app);
var smtpServerStatus = { ready: false, user: "" };
var otpStore = /* @__PURE__ */ new Map();
app.get("/api/smtp-status", (req, res) => {
  res.json({
    success: true,
    smtp: smtpServerStatus
  });
});
app.post("/api/send-verification-code", async (req, res) => {
  try {
    const { email, name } = req.body;
    if (!email || typeof email !== "string") {
      res.status(400).json({
        success: false,
        errorType: "verification_error",
        error: "Valid email address is required."
      });
      return;
    }
    const cleanEmail = email.trim().toLowerCase();
    const now = Date.now();
    const existing = otpStore.get(cleanEmail);
    if (existing && now - existing.createdAt < 3e4) {
      console.log(`[Deduplication] Prevented duplicate email dispatch to ${cleanEmail}. Sent ${Math.round((now - existing.createdAt) / 1e3)}s ago.`);
      res.json({
        success: true,
        message: `A security verification code has been sent directly to ${cleanEmail}. Please check your email inbox.`,
        delivered: true,
        expiresInSeconds: Math.round((existing.expiresAt - now) / 1e3),
        smtpConfigured: true
      });
      return;
    }
    const code = Math.floor(1e5 + Math.random() * 9e5).toString();
    const expiresAt = now + 10 * 60 * 1e3;
    const result = await sendVerificationEmail({ to: cleanEmail, name, code });
    if (!result.success || !result.delivered) {
      res.status(503).json({
        success: false,
        message: result.message || "Email delivery is unavailable. Please try again later."
      });
      return;
    }
    otpStore.set(cleanEmail, { code, expiresAt, createdAt: now, name });
    res.json({
      success: true,
      message: result.message,
      delivered: true,
      expiresInSeconds: 600,
      smtpConfigured: result.smtpConfigured
    });
  } catch (error) {
    console.error("Email Dispatch Error:", error);
    res.status(500).json({
      success: false,
      errorType: "network_error",
      error: "Network Error: Unable to communicate with the email transport server."
    });
  }
});
app.post("/api/verify-code", (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    res.status(400).json({
      success: false,
      errorType: "verification_error",
      error: "Email and 6-digit verification code are required."
    });
    return;
  }
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.toString().trim();
  const record = otpStore.get(cleanEmail);
  if (!record) {
    res.status(400).json({
      success: false,
      errorType: "verification_error",
      error: "Verification Error: No active code found for this email address or it has expired. Please request a new code."
    });
    return;
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    res.status(400).json({
      success: false,
      errorType: "verification_error",
      error: "Verification Error: Your code has expired after 10 minutes. Please request a new verification code."
    });
    return;
  }
  if (record.code !== cleanCode) {
    res.status(400).json({
      success: false,
      errorType: "verification_error",
      error: "Verification Error: The 6-digit code entered is incorrect. Please check your Gmail inbox and try again."
    });
    return;
  }
  otpStore.delete(cleanEmail);
  res.json({ success: true, verified: true, message: "Verification successful." });
});
var getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in process.env");
  }
  return new import_genai.GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
};
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    institution: "Torres Capitol College",
    version: "2.5.0-PROD",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.post("/api/ai/analyze-performance", async (req, res) => {
  try {
    const { students, department, course } = req.body;
    const ai = getGeminiClient();
    const prompt = `You are an expert Academic Dean and Data Analyst for Torres Capitol College.
Analyze the following student dataset for department "${department || "All Departments"}":
${JSON.stringify(students, null, 2)}

Please provide a concise, highly professional academic review formatted in Markdown:
1. **Executive Performance Summary**: Overall GPA & Attendance health.
2. **At-Risk Identification**: Key factors triggering watchlist or critical flags.
3. **Actionable Faculty Interventions**: 3 specific recommendations for department faculty to boost retention and performance.
4. **Accreditation Note**: Compliance readiness status.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an academic compliance & student success analyst for Torres Capitol College."
      }
    });
    res.json({ success: true, analysis: response.text });
  } catch (error) {
    console.error("Gemini AI Analysis Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate AI performance analysis."
    });
  }
});
app.post("/api/ai/generate-compliance-report", async (req, res) => {
  try {
    const { month, year, department, metrics } = req.body;
    const ai = getGeminiClient();
    const prompt = `Generate an Official Monthly Academic Compliance & Accreditation Report for Torres Capitol College.
Period: ${month} ${year}
Department: ${department || "College-Wide"}
Key Metrics: ${JSON.stringify(metrics, null, 2)}

Provide a formal executive compliance statement for administrative oversight & accreditation review:
- **Section I: Administrative Executive Summary**
- **Section II: Grade Integrity & Audit Trail Conformance**
- **Section III: Attendance Retention & Student Risk Mitigation**
- **Section IV: System Reliability, RBAC & Encryption Attestation**`;
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt
    });
    res.json({ success: true, report: response.text });
  } catch (error) {
    console.error("Gemini AI Report Error:", error);
    res.status(500).json({
      success: false,
      error: error?.message || "Failed to generate compliance report."
    });
  }
});
async function startServer() {
  console.log("\u{1F50D} Testing SMTP Server connection configuration...");
  smtpServerStatus = await verifySmtpConfiguration();
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Torres Capitol College SIS server running on http://0.0.0.0:${PORT}`);
    if (smtpServerStatus.ready) {
      console.log(`\u{1F4E7} SMTP Transport Engine Ready: Active for ${smtpServerStatus.user}`);
    } else {
      console.warn(`\u26A0\uFE0F SMTP Transport Warning: ${smtpServerStatus.error}`);
    }
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
