import { Meteor } from 'meteor/meteor';
import React from 'react';
import { render } from 'react-dom';

import App from '/imports/ui/App';

// Redirect all requests to www
if(window.location.host.indexOf('batterysf.com') >= 0 && window.location.host.indexOf('www') !== 0) {
	window.location.href = `${window.location.protocol}//www.${window.location.host}${window.location.pathname}`;
}

Meteor.startup(() => {
	render(<App />, document.getElementById('app'));
});
