import axios, { AxiosInstance, isAxiosError } from "axios";
import { APIError } from "better-auth/api";

export function createMailtrapApi(apiKey: string) {
  return axios.create({
    baseURL: "https://sandbox.api.mailtrap.io",
    headers: {
      "Content-Type": "application/json",
      "Api-Token": apiKey,
    },
  });
}

interface Address {
  email: string;
  name?: string;
}

interface SendEmailPayload {
  from: Address;
  to: Address[];
  cc?: Address[];
  bcc?: Address[];
  subject: string;
  text: string;
  html?: string;
}

interface SendEmailResponse {
  success: boolean;
  message_ids: string[];
}

interface ApiResult<T> {
  ok: boolean;
  data: T;
}

export async function sendEmail(
  api: AxiosInstance,
  inboxId: string,
  payload: SendEmailPayload,
): Promise<ApiResult<string[]>> {
  try {
    const res = await api.post<SendEmailResponse>(
      `/api/send/${inboxId}`,
      payload,
    );
    return {
      ok: res.data.success,
      data: res.data.message_ids,
    };
  } catch (e) {
    if (!isAxiosError(e)) {
      throw new APIError("INTERNAL_SERVER_ERROR", { message: "network_error" });
    }
    switch (e.status) {
      case 400:
      case 401:
      case 429:
      case 500:
        throw new APIError(e.status, {
          message: JSON.stringify(e.response?.data ?? ""),
        });
      default:
        throw new APIError("INTERNAL_SERVER_ERROR", {
          message: "unexpected_error",
        });
    }
  }
}
