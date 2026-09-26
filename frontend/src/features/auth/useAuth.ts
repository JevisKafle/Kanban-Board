import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMe, loginRequest, registerRequest, logoutRequest } from "./auth";

export const ME_QUERY_KEY = ["me"];

export function useMe() {
  return useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: fetchMe,
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: { username: string; password: string }) =>
      loginRequest(payload.username, payload.password),
    onSuccess: (user) => qc.setQueryData(ME_QUERY_KEY, user),
  });
}

export function useRegister() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      username: string;
      email: string;
      password: string;
    }) => registerRequest(payload.username, payload.email, payload.password),
    onSuccess: (user) => qc.setQueryData(ME_QUERY_KEY, user),
  });
}

export function useLogout() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess: () => qc.setQueryData(ME_QUERY_KEY, null),
  });
}
