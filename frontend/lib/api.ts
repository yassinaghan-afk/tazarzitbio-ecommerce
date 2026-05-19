const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type HealthResponse = {
  status: string;
  version: string;
  environment: string;
  database: string;
};

export async function fetchHealth(): Promise<HealthResponse | null> {
  try {
    const response = await fetch(`${API_URL}/health`, {
      next: { revalidate: 30 },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as HealthResponse;
  } catch {
    return null;
  }
}
