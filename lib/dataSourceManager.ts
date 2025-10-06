/**
 * Data Source Manager
 * Handles connections to external data sources (SQL, REST API, GraphQL)
 */

export interface DataSource {
  id: string;
  name: string;
  type: "sql" | "rest" | "graphql" | "csv" | "json" | "webhook";
  config: DataSourceConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface DataSourceConfig {
  // SQL Database
  host?: string;
  port?: number;
  database?: string;
  username?: string;
  password?: string; // Encrypted
  ssl?: boolean;
  
  // REST API
  baseUrl?: string;
  headers?: Record<string, string>;
  auth?: {
    type: "none" | "bearer" | "basic" | "apiKey";
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
    apiKeyHeader?: string;
  };
  
  // GraphQL
  endpoint?: string;
  
  // CSV/JSON
  url?: string;
  
  // Webhook
  webhookUrl?: string;
  method?: "GET" | "POST";
}

export interface DataQuery {
  sourceId: string;
  query: string | object; // SQL query or REST endpoint or GraphQL query
  params?: Record<string, any>;
  transform?: string; // JavaScript transform function
  cache?: {
    enabled: boolean;
    ttl: number; // seconds
  };
}

/**
 * Execute a data query
 */
export async function executeDataQuery(
  query: DataQuery,
  dataSource: DataSource
): Promise<any> {
  try {
    switch (dataSource.type) {
      case "sql":
        return await executeSQLQuery(query, dataSource);
      case "rest":
        return await executeRESTQuery(query, dataSource);
      case "graphql":
        return await executeGraphQLQuery(query, dataSource);
      case "json":
        return await fetchJSONData(query, dataSource);
      case "csv":
        return await fetchCSVData(query, dataSource);
      default:
        throw new Error(`Unsupported data source type: ${dataSource.type}`);
    }
  } catch (error) {
    console.error("[DataSource] Query execution failed", error);
    throw error;
  }
}

async function executeSQLQuery(query: DataQuery, source: DataSource): Promise<any> {
  // Call backend API endpoint that handles SQL queries securely
  const response = await fetch("/api/data-sources/execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sourceId: source.id,
      type: "sql",
      query: query.query,
      params: query.params,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`SQL query failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return transformData(data, query.transform);
}

async function executeRESTQuery(query: DataQuery, source: DataSource): Promise<any> {
  const config = source.config;
  const url = `${config.baseUrl}${query.query}`;
  
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
        const basic = btoa(`${config.auth.username}:${config.auth.password}`);
        headers["Authorization"] = `Basic ${basic}`;
        break;
      case "apiKey":
        headers[config.auth.apiKeyHeader || "X-API-Key"] = config.auth.apiKey || "";
        break;
    }
  }
  
  const response = await fetch(url, {
    method: "GET",
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`REST API call failed: ${response.statusText}`);
  }
  
  const data = await response.json();
  return transformData(data, query.transform);
}

async function executeGraphQLQuery(query: DataQuery, source: DataSource): Promise<any> {
  const config = source.config;
  
  const response = await fetch(config.endpoint!, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
    body: JSON.stringify({
      query: query.query,
      variables: query.params,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`GraphQL query failed: ${response.statusText}`);
  }
  
  const result = await response.json();
  if (result.errors) {
    throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
  }
  
  return transformData(result.data, query.transform);
}

async function fetchJSONData(query: DataQuery, source: DataSource): Promise<any> {
  const response = await fetch(source.config.url!);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON: ${response.statusText}`);
  }
  
  const data = await response.json();
  return transformData(data, query.transform);
}

async function fetchCSVData(query: DataQuery, source: DataSource): Promise<any> {
  const response = await fetch(source.config.url!);
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
  
  return transformData(data, query.transform);
}

function transformData(data: any, transformFn?: string): any {
  if (!transformFn) return data;
  
  try {
    // Create a safe sandbox for transform function
    const fn = new Function("data", transformFn);
    return fn(data);
  } catch (error) {
    console.error("[DataSource] Transform failed", error);
    return data;
  }
}

/**
 * Formula evaluation for table cells
 */
export class FormulaEngine {
  private context: Record<string, any>;
  
  constructor(context: Record<string, any> = {}) {
    this.context = context;
  }
  
  evaluate(formula: string): any {
    // Remove leading =
    if (formula.startsWith("=")) {
      formula = formula.substring(1);
    }
    
    // Replace cell references (A1, B2, etc.) with values
    formula = this.replaceCellReferences(formula);
    
    // Evaluate formula
    try {
      // Support common functions
      const functions = {
        SUM: (...args: number[]) => args.reduce((a, b) => a + b, 0),
        AVG: (...args: number[]) => {
          const sum = args.reduce((a, b) => a + b, 0);
          return sum / args.length;
        },
        COUNT: (...args: any[]) => args.length,
        MIN: (...args: number[]) => Math.min(...args),
        MAX: (...args: number[]) => Math.max(...args),
        IF: (condition: boolean, trueVal: any, falseVal: any) => condition ? trueVal : falseVal,
        ROUND: (num: number, decimals: number) => Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals),
        ABS: (num: number) => Math.abs(num),
        SQRT: (num: number) => Math.sqrt(num),
        POW: (base: number, exp: number) => Math.pow(base, exp),
        CONCAT: (...args: any[]) => args.join(""),
        UPPER: (str: string) => str.toUpperCase(),
        LOWER: (str: string) => str.toLowerCase(),
        LEN: (str: string) => str.length,
        NOW: () => new Date(),
        TODAY: () => new Date().toISOString().split("T")[0],
      };
      
      // Create evaluation context
      const evalContext = { ...functions, ...this.context };
      const fn = new Function(...Object.keys(evalContext), `return ${formula}`);
      return fn(...Object.values(evalContext));
    } catch (error) {
      console.error("[FormulaEngine] Evaluation failed", error);
      return "#ERROR";
    }
  }
  
  private replaceCellReferences(formula: string): string {
    // Replace A1, B2, etc. with actual values from context
    return formula.replace(/[A-Z]+[0-9]+/g, (match) => {
      const value = this.context[match];
      return typeof value === "string" ? `"${value}"` : String(value || 0);
    });
  }
  
  setCellValue(ref: string, value: any): void {
    this.context[ref] = value;
  }
  
  getCellValue(ref: string): any {
    return this.context[ref];
  }
}

/**
 * Data validation rules
 */
export interface ValidationRule {
  type: "required" | "number" | "email" | "url" | "range" | "regex" | "custom";
  message?: string;
  params?: any;
}

export function validateCell(value: any, rules: ValidationRule[]): { valid: boolean; error?: string } {
  for (const rule of rules) {
    switch (rule.type) {
      case "required":
        if (!value || value === "") {
          return { valid: false, error: rule.message || "This field is required" };
        }
        break;
      case "number":
        if (isNaN(Number(value))) {
          return { valid: false, error: rule.message || "Must be a number" };
        }
        break;
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return { valid: false, error: rule.message || "Invalid email address" };
        }
        break;
      case "url":
        try {
          new URL(value);
        } catch {
          return { valid: false, error: rule.message || "Invalid URL" };
        }
        break;
      case "range":
        const num = Number(value);
        if (num < rule.params.min || num > rule.params.max) {
          return { 
            valid: false, 
            error: rule.message || `Value must be between ${rule.params.min} and ${rule.params.max}` 
          };
        }
        break;
      case "regex":
        if (!new RegExp(rule.params.pattern).test(value)) {
          return { valid: false, error: rule.message || "Invalid format" };
        }
        break;
    }
  }
  
  return { valid: true };
}
