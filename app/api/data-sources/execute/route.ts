import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Pool } from "pg";
import mysql from "mysql2/promise";

// Cache for query results
const cache = new Map<string, { data: any; timestamp: number }>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sourceId, query, params, transform, useCache = true } = body;

    // Check cache first
    if (useCache) {
      const cacheKey = `${sourceId}:${JSON.stringify({ query, params })}`;
      const cached = cache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < 300000) { // 5 minutes
        console.log("[DataSource] Cache hit");
        return NextResponse.json({ ok: true, data: cached.data, cached: true });
      }
    }

    // Get data source
    const dataSource = await (prisma as any).dataSource.findUnique({
      where: { id: sourceId },
    });

    if (!dataSource) {
      return NextResponse.json(
        { ok: false, error: { code: "NOT_FOUND", message: "Data source not found" } },
        { status: 404 }
      );
    }

    const config = JSON.parse(dataSource.config);
    let result: any;

    switch (dataSource.type) {
      case "sql":
        result = await executeSQLQuery(config, query, params);
        break;
      case "rest":
        result = await executeRESTQuery(config, query, params);
        break;
      case "graphql":
        result = await executeGraphQLQuery(config, query, params);
        break;
      case "json":
        result = await fetchJSON(config.url);
        break;
      case "csv":
        result = await fetchCSV(config.url);
        break;
      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`);
    }

    // Apply transform if provided
    if (transform) {
      try {
        const fn = new Function("data", transform);
        result = fn(result);
      } catch (error: any) {
        console.error("[DataSource] Transform error", error);
      }
    }

    // Cache result
    if (useCache) {
      const cacheKey = `${sourceId}:${JSON.stringify({ query, params })}`;
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
    }

    return NextResponse.json({ ok: true, data: result });
  } catch (error: any) {
    console.error("[DataSource] Execute error", error);
    return NextResponse.json(
      { ok: false, error: { code: "EXECUTION_ERROR", message: error.message } },
      { status: 500 }
    );
  }
}

async function executeSQLQuery(config: any, query: string, params: any = {}) {
  // Detect database type based on config
  const isPostgres = config.port === 5432 || !config.port;

  if (isPostgres) {
    const pool = new Pool({
      host: config.host,
      port: config.port || 5432,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? { rejectUnauthorized: false } : false,
    });

    try {
      // Replace :paramName with $1, $2, etc.
      const paramNames = Object.keys(params);
      let pgQuery = query;
      const values: any[] = [];
      
      paramNames.forEach((name, index) => {
        pgQuery = pgQuery.replace(new RegExp(`:${name}`, "g"), `$${index + 1}`);
        values.push(params[name]);
      });

      const result = await pool.query(pgQuery, values);
      await pool.end();
      return result.rows;
    } catch (error) {
      await pool.end();
      throw error;
    }
  } else {
    // MySQL
    const connection = await mysql.createConnection({
      host: config.host,
      port: config.port || 3306,
      database: config.database,
      user: config.username,
      password: config.password,
      ssl: config.ssl ? {} : undefined,
    });

    try {
      // Replace :paramName with ?
      let mysqlQuery = query;
      const values: any[] = [];
      const paramNames = Object.keys(params);
      
      paramNames.forEach((name) => {
        mysqlQuery = mysqlQuery.replace(`:${name}`, "?");
        values.push(params[name]);
      });

      const [rows] = await connection.execute(mysqlQuery, values);
      await connection.end();
      return rows;
    } catch (error) {
      await connection.end();
      throw error;
    }
  }
}

async function executeRESTQuery(config: any, endpoint: string, params: any = {}) {
  const url = `${config.baseUrl}${endpoint}`;
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...config.headers,
  };

  // Add authentication
  if (config.auth) {
    switch (config.auth.type) {
      case "bearer":
        headers["Authorization"] = `Bearer ${config.auth.token}`;
        break;
      case "basic":
        const basic = Buffer.from(`${config.auth.username}:${config.auth.password}`).toString("base64");
        headers["Authorization"] = `Basic ${basic}`;
        break;
      case "apiKey":
        headers[config.auth.apiKeyHeader || "X-API-Key"] = config.auth.apiKey;
        break;
    }
  }

  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`REST API error: ${response.statusText}`);
  }

  return await response.json();
}

async function executeGraphQLQuery(config: any, query: string, variables: any = {}) {
  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    throw new Error(`GraphQL error: ${response.statusText}`);
  }

  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }

  return result.data;
}

async function fetchJSON(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON: ${response.statusText}`);
  }
  return await response.json();
}

async function fetchCSV(url: string) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch CSV: ${response.statusText}`);
  }

  const text = await response.text();
  const rows = text.split("\n").map(row => row.split(","));
  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj: any = {};
    headers.forEach((header, i) => {
      obj[header.trim()] = row[i]?.trim();
    });
    return obj;
  });

  return data;
}
