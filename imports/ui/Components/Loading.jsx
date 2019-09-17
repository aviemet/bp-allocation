import React, { useState, useEffect } from 'react';

const Loading = ({ component: Component, loading }) => {
	const [ loadingState, setLoadingState ] = useState(loading);
	console.log({ loading, loadingState });

	useEffect(() => {
		if(!loading) {
			setLoadingState(false);
		}
	}, [loading]);

	if(loadingState) return <h1>Loading</h1>;
	return <Component />;
};

export default Loading;