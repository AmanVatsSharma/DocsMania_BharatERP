import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// Encryption for sensitive data (passwords, tokens)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString("hex");
const IV_LENGTH = 16;

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

function decrypt(text: string): string {
  const parts = text.split(":");
  const iv = Buffer.from(parts.shift()!, "hex");
  const encryptedText = Buffer.from(parts.join(":"), "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(ENCRYPTION_KEY.substring(0, 32)), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

export async function GET(request: NextRequest) {
  try {
    // In production, add authentication check
    // const session = await getSession(request);
    // if (!session) return NextResponse.json({ ok: false, error: { code: "UNAUTHORIZED" } }, { status: 401 });

    const dataSources = await (prisma as any).dataSource.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Decrypt sensitive fields before sending
    const decrypted = dataSources.map((source: any) => {
      const config = JSON.parse(source.config);
      if (config.password) config.password = decrypt(config.password);
      if (config.auth?.token) config.auth.token = decrypt(config.auth.token);
      if (config.auth?.apiKey) config.auth.apiKey = decrypt(config.auth.apiKey);
      return { ...source, config };
    });

    return NextResponse.json({ ok: true, data: decrypted });
  } catch (error: any) {
    console.error("[DataSources] GET error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, config } = body;

    // Encrypt sensitive fields
    const encryptedConfig = { ...config };
    if (config.password) encryptedConfig.password = encrypt(config.password);
    if (config.auth?.token) encryptedConfig.auth.token = encrypt(config.auth.token);
    if (config.auth?.apiKey) encryptedConfig.auth.apiKey = encrypt(config.auth.apiKey);

    const dataSource = await (prisma as any).dataSource.create({
      data: {
        name,
        type,
        config: JSON.stringify(encryptedConfig),
      },
    });

    return NextResponse.json({ ok: true, data: dataSource });
  } catch (error: any) {
    console.error("[DataSources] POST error", error);
    return NextResponse.json(
      { ok: false, error: { code: "INTERNAL_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}
