import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteAccount, getProfile, updateProfile } from '@/lib/api/profile'
import type { Profile, ProfileUpdate } from '@/lib/types/database'

const PROFILE_QUERY_KEY = 'profile'

export function useProfile(enabled = true) {
  return useQuery({
    queryKey: [PROFILE_QUERY_KEY],
    queryFn: getProfile,
    staleTime: 60 * 1000,
    enabled,
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProfileUpdate) => updateProfile(data),
    onMutate: async (data) => {
      await queryClient.cancelQueries({ queryKey: [PROFILE_QUERY_KEY] })
      const previousProfile = queryClient.getQueryData<Profile>([PROFILE_QUERY_KEY])

      if (previousProfile) {
        queryClient.setQueryData<Profile>([PROFILE_QUERY_KEY], {
          ...previousProfile,
          ...data,
          updated_at: new Date().toISOString(),
        })
      }

      return { previousProfile }
    },
    onError: (_error, _data, context) => {
      if (context?.previousProfile) {
        queryClient.setQueryData([PROFILE_QUERY_KEY], context.previousProfile)
      }
    },
    onSuccess: (data) => {
      queryClient.setQueryData([PROFILE_QUERY_KEY], data)
      queryClient.invalidateQueries({ queryKey: [PROFILE_QUERY_KEY] })
    },
  })
}

export function useDeleteAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: [PROFILE_QUERY_KEY] })
    },
  })
}
