import React, { useState } from 'react';
import PropTypes from 'prop-types';

import styled from 'styled-components';

import { Images } from '/imports/api';

import { Progress, Input, Segment } from 'semantic-ui-react';

const FileUpload = props => {

	const [ uploading, setUploading ]   = useState([]);
	const [ progress, setProgress ]     = useState(0);
	const [ inProgress, setInProgress ] = useState(false);
	const [ color, setColor ]           = useState('orange');

	const handleUpload = e => {
		e.preventDefault();

		if (e.currentTarget.files && e.currentTarget.files[0]) {
			// We upload only one file, in case there was multiple files selected
			var file = e.currentTarget.files[0];

			if (file) {
				let uploadInstance = Images.insert({
					file: file,
					meta: {
						locator: props.fileLocator,
						// userId: Meteor.userId() // Optional, used to check on server for file tampering
					},
					streams: 'dynamic',
					chunkSize: 'dynamic',
					allowWebWorkers: true // If you see issues with uploads, change this to false
				}, false);

				setUploading(uploadInstance); // Keep track of this instance to use below
				setInProgress(true); // Show the progress bar now

				// These are the event functions, don't need most of them, it shows where we are in the process
				uploadInstance.on('start', function () {
					if(props.onStart) props.onStart();

				}).on('progress', function (progress, fileObj) {
					if(props.onProgress) props.onProgress({ progress: progress, file: fileObj, uploading });

					// Update our progress bar
					setProgress(progress);

				}).on('uploaded', function (error, fileObj) {
					if(props.onUploaded) props.onUploaded({ error: error, file: fileObj });

					setUploading([]);
					setInProgress(false);
					setColor('green');
					// setProgress(0);

				}).on('end', function (error, fileObj) {
					if(props.onEnd) props.onEnd({ error: error, file: fileObj });

				}).on('error', function (error, fileObj) {
					console.error('Error during upload: ' + error);
					if(props.onError) props.onError({ error: error, file: fileObj });

				});

				uploadInstance.start(); // Must manually start the upload
			}
		}
	};

	// let file = Images.findOne({ _id: props.image });

	return (
		<FileUploadContainer>
			<Input
				type='file'
				disabled={ inProgress }
				onChange={ handleUpload }
				width={ props.width }
			/>
			<Progress
				attached='bottom'
				percent={ progress }
				color={ color }
			/>
		</FileUploadContainer>
	);
};

const FileUploadContainer = styled(Segment)`
  &&{
    padding: 0;
    margin: 0;

    input{
      margin-top: 6px;
      margin-bottom: 6px;
      border: none !important;
    }

    .progress .bar{
      min-width: 2px !important;
    }
  }
`;

FileUpload.propTypes = {
	image: PropTypes.object,
	width: PropTypes.number,
	fileLocator: PropTypes.object,
	onStart: PropTypes.func,
	onProgress: PropTypes.func,
	onUploaded: PropTypes.func,
	onEnd: PropTypes.func,
	onError: PropTypes.func
};

export default FileUpload;
