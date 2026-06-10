"use client";

import { useState, useCallback } from "react";
import { apiClient } from "@/lib/api-client";
import type { AxiosRequestConfig } from "axios";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T = unknown>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  function setLoading() {
    setState({ data: null, loading: true, error: null });
  }

  function setData(data: T) {
    setState({ data, loading: false, error: null });
  }

  function setError(msg: string) {
    setState({ data: null, loading: false, error: msg });
  }

  const get = useCallback(async (url: string, config?: AxiosRequestConfig) => {
    setLoading();
    try {
      const res = await apiClient.get<T>(url, config);
      setData(res.data);
      return res.data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Request failed";
      setError(msg);
      return null;
    }
  }, []);

  const post = useCallback(async <R = T>(url: string, body: unknown, config?: AxiosRequestConfig) => {
    setLoading();
    try {
      const res = await apiClient.post<R>(url, body, config);
      setState({ data: res.data as unknown as T, loading: false, error: null });
      return res.data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Request failed";
      setError(msg);
      return null;
    }
  }, []);

  const put = useCallback(async <R = T>(url: string, body: unknown, config?: AxiosRequestConfig) => {
    setLoading();
    try {
      const res = await apiClient.put<R>(url, body, config);
      setState({ data: res.data as unknown as T, loading: false, error: null });
      return res.data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Request failed";
      setError(msg);
      return null;
    }
  }, []);

  const del = useCallback(async (url: string, config?: AxiosRequestConfig) => {
    setLoading();
    try {
      const res = await apiClient.delete<T>(url, config);
      setData(res.data);
      return res.data;
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Request failed";
      setError(msg);
      return null;
    }
  }, []);

  return { ...state, get, post, put, del };
}
