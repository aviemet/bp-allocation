import sgMail from '@sendgrid/mail'

const sendMassEmail = messages => {
	sgMail.setApiKey(process.env.SENDGRID_API_KEY)

	const sentMail = sgMail.send(messages)

	sentMail.then(response => {
		console.log(response)
	}, error => {
		console.error(error)

		if (error.response) {
			console.error(error.response.body)
		}
	})
}

export { sendMassEmail }
