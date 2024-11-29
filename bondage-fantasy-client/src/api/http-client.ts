class HttpClient {
  async post<T>(url: string, body?: unknown): Promise<T> {
    return this.sendRequest(url, { method: "POST", body });
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
      },
    });
    if (!response.ok) {
      throw await this.getJsonFromResponse(response);
    }

    return (await this.getJsonFromResponse(response)) as T;
  }

  private async getJsonFromResponse(response: Response): Promise<unknown> {
    const responseAsText = await response.text();
    if (responseAsText.length === 0) {
      return undefined;
    }

    return JSON.parse(responseAsText);
  }
}

export const httpClient = new HttpClient();
