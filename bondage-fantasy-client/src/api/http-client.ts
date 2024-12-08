import { useAppStore } from "../store";
import Cookies from "js-cookie";

class HttpClient {
  private csrfToken?: string;

  async get<T>(
    url: string,
    params?: {
      characterId?: number;
      doNotWaitForSessionInitialization?: boolean;
    },
  ): Promise<T> {
    return this.sendRequest(url, {
      method: "GET",
      characterId: params?.characterId,
      doNotWaitForSessionInitialization:
        params?.doNotWaitForSessionInitialization,
    });
  }

  async post<T>(
    url: string,
    body?: unknown,
    params?: { characterId?: number },
  ): Promise<T> {
    return this.sendRequest(url, {
      method: "POST",
      body,
      characterId: params?.characterId,
    });
  }

  private async sendRequest<T>(
    url: string,
    params: {
      method: string;
      body?: unknown;
      characterId?: number;
      doNotWaitForSessionInitialization?: boolean;
    },
  ): Promise<T> {
    if (!params.doNotWaitForSessionInitialization) {
      await useAppStore.getState().sessionInitializedPromise;
    }
    const headers: HeadersInit = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (this.csrfToken) {
      headers["X-XSRF-TOKEN"] = this.csrfToken;
    }
    const characterId =
      params.characterId ?? useAppStore.getState().character?.id;
    if (characterId) {
      headers["X-CHARACTER-ID"] = characterId.toString();
    }

    const response = await fetch(`/api/${url}`, {
      method: params.method,
      body: params.body != null ? JSON.stringify(params.body) : undefined,
      headers,
    });

    const newCsrfToken = this.readCsrfTokenFromCookie();
    if (newCsrfToken) {
      this.csrfToken = newCsrfToken;
    }

    if (!response.ok) {
      throw await this.tryGetJsonFromResponse(response);
    }

    return (await this.tryGetJsonFromResponse(response)) as T;
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
