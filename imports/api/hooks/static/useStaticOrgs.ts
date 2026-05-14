import { useCallback, useEffect, useState } from "react"

import { callOrganizationsList } from "/imports/api/methods/staticReadCalls"
import { useData } from "/imports/api/providers"
import { type OrgDataWithComputed, type PledgeWithOrg } from "/imports/api/hooks/useOrgs"

export const useStaticOrgs = () => {
	const data = useData()
	const themeId = data?.themeId

	const [state, setState] = useState<{
		orgs: OrgDataWithComputed[]
		topOrgs: OrgDataWithComputed[]
		pledges: PledgeWithOrg[]
		orgsLoading: boolean
		error: Error | null
	}>({
		orgs: [],
		topOrgs: [],
		pledges: [],
		orgsLoading: true,
		error: null,
	})

	const refresh = useCallback(async () => {
		if(!themeId) {
			setState({
				orgs: [],
				topOrgs: [],
				pledges: [],
				orgsLoading: true,
				error: null,
			})
			return
		}
		setState(previous => ({ ...previous, orgsLoading: true, error: null }))
		try {
			const result = await callOrganizationsList(themeId)
			if(!result) {
				setState({
					orgs: [],
					topOrgs: [],
					pledges: [],
					orgsLoading: false,
					error: null,
				})
				return
			}
			setState({
				orgs: result.orgs,
				topOrgs: result.topOrgs,
				pledges: result.pledges,
				orgsLoading: false,
				error: null,
			})
		} catch (caught) {
			const error = caught instanceof Error ? caught : new Error(String(caught))
			setState(previous => ({ ...previous, orgsLoading: false, error }))
		}
	}, [themeId])

	useEffect(() => {
		queueMicrotask(() => {
			void refresh()
		})
	}, [refresh])

	return { ...state, refresh }
}
