import Cookies from "js-cookie";

class HttpClient {
  private csrfToken?: Promise<string>;

  async get<T>(url: string): Promise<T> {
    return this.sendRequest(url, {
      method: "GET",
    });
  }

  async post<T>(url: string, body?: unknown): Promise<T> {
    return this.sendRequest(url, {
      method: "POST",
      body,
    });
  }

  private async sendRequest<T>(
    url: string,
    params: { method: string; body?: unknown },
  ): Promise<T> {
    const response = await fetch(`/api/${url}`, {
      method: params.method,
      body: params.body != null ? JSON.stringify(params.body) : undefined,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": await this.getCsrfToken(),
      },
    });

    const newCsrfToken = this.readCsrfTokenFromCookie();
    if (newCsrfToken) {
      this.csrfToken = Promise.resolve(newCsrfToken);
    }

    if (!response.ok) {
      throw await this.tryGetJsonFromResponse(response);
    }

    return (await this.tryGetJsonFromResponse(response)) as T;
  }

  private async getCsrfToken(): Promise<string> {
    if (this.csrfToken) {
      return this.csrfToken;
    }
    this.csrfToken = this.fetchCsrfToken();
    return this.csrfToken;
  }

  private async fetchCsrfToken(): Promise<string> {
    await fetch("/api/csrf/token", { method: "GET" });
    return this.readCsrfTokenFromCookie() as string;
  }

  private readCsrfTokenFromCookie(): string | undefined {
    return Cookies.get("XSRF-TOKEN");
  }

  private async tryGetJsonFromResponse(response: Response): Promise<unknown> {
    const responseAsText = await response.text();
    if (responseAsText.length === 0) {
      return undefined;
    }

    try {
      return JSON.parse(responseAsText);
    } catch {
      return undefined;
    }
  }
}

export const httpClient = new HttpClient();
