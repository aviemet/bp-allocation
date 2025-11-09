import { Meteor } from "meteor/meteor"
import { createRoot } from "react-dom/client"
import App from "/imports/ui/App"

// Redirect all requests to www
if(window.location.host.indexOf("batterysf.com") >= 0 && window.location.host.indexOf("www") !== 0) {
	window.location.href = `${window.location.protocol}//www.${window.location.host}${window.location.pathname}`
}

Meteor.startup(() => {
	const appElement = document.getElementById("app")
	if(!appElement) {
		throw new Error("Could not find app element")
	}
	const root = createRoot(appElement)
	root.render(<App />)
})
