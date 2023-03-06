import { useRoute, useLocation } from 'wouter'

const useParams = () => {
	const [location] = useLocation()
	const [_, params] = useRoute(location)

	return params as Record<string, string|null>
}

export default useParams
