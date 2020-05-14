import React from 'react';
import RichTextEditor from '/imports/ui/Components/RichTextEditor';
import TextMembersButton from '/imports/ui/Components/TextMembersButton';
import { useMessages } from '/imports/api/providers';

const Messages = props => {
	const messages = useMessages();
	console.log({ messages });

	return (
		<>
			<RichTextEditor />

			<hr />

			<TextMembersButton
				message="From Battery Powered: Excuse us! We sent a bad link. The finalists can be seen here http://bit.ly/2TECprF Voting starts later tonight!"
				title='Voting to Start Later'
				link={ false }
			/>
		</>
	);
};

export default Messages;