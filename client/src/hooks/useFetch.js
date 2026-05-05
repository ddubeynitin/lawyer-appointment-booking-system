import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const useFetch = (url, axiosConfig = {}, queryOptions = {}) => {
  const query = useQuery({
    queryKey: ["api", url, axiosConfig],
    queryFn: async () => {
      const response = await axios.get(url, axiosConfig);
      return response.data;
    },
    enabled: Boolean(url),
    ...queryOptions,
  });

  return {
    data: query.data ?? null,
    loading: query.isPending,
    error: query.error,
    refetch: query.refetch,
  };
};

export default useFetch;
