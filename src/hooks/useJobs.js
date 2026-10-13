import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetchJobs, createJob, updateJob, deleteJob } from '../api/jobsApi'
import { adaptJobFromApi } from '../utils/jobAdapter'

export function useJobs(filters) {
  return useQuery({
    queryKey: ['jobs', filters],
    queryFn: async () => {
      const res = await fetchJobs(filters)
      return {
        jobs: (res.data.data || []).map(adaptJobFromApi),
        pagination: res.data.pagination,
      }
    },
    staleTime: 0,
    cacheTime: 0,
    refetchOnWindowFocus: true,
  })
}

export function useCreateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: createJob,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useUpdateJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateJob(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}

export function useDeleteJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: deleteJob,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['jobs'] }),
  })
}
