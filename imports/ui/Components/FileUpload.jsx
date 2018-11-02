import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';

import { Images } from '/imports/api';

import { Loader, Form, Progress, Input, Segment } from 'semantic-ui-react';

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

class FileUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      uploading: [],
      progress: 0,
      inProgress: false,
      color: 'orange'
    };

    this.handleUpload = this.handleUpload.bind(this);
  }

  handleUpload(e) {
    e.preventDefault();

    let that = this;

    if (e.currentTarget.files && e.currentTarget.files[0]) {
      // We upload only one file, in case there was multiple files selected
      var file = e.currentTarget.files[0];

      if (file) {
        let uploadInstance = Images.insert({
          file: file,
          meta: {
            locator: that.props.fileLocator,
            // userId: Meteor.userId() // Optional, used to check on server for file tampering
          },
          streams: 'dynamic',
          chunkSize: 'dynamic',
          allowWebWorkers: true // If you see issues with uploads, change this to false
        }, false);

        that.setState({
          uploading: uploadInstance, // Keep track of this instance to use below
          inProgress: true // Show the progress bar now
        });

        // These are the event functions, don't need most of them, it shows where we are in the process
        uploadInstance.on('start', function () {
          console.log('Starting');
          if(that.props.onStart) that.props.onStart();

        }).on('progress', function (progress, fileObj) {
          console.log('Upload Percentage: ' + progress);
          if(that.props.onProgress) that.props.onProgress({progress: progress, file: fileObj});

          // Update our progress bar
          that.setState({
            progress: progress
          });

        }).on('uploaded', function (error, fileObj) {
          console.log('uploaded: ', fileObj);
          if(that.props.onUploaded) that.props.onUploaded({error: error, file: fileObj});

          that.setState({
            uploading: [],
            progress: 0,
            inProgress: false,
            color: 'green'
          });

        }).on('end', function (error, fileObj) {
          console.log('On end File Object: ', fileObj);
          if(that.props.onEnd) that.props.onEnd({error: error, file: fileObj});

        }).on('error', function (error, fileObj) {
          console.log('Error during upload: ' + error)
          if(that.props.onError) that.props.onError({error: error, file: fileObj});

        })

        uploadInstance.start(); // Must manually start the upload
      }
    }
  }

  render() {
    // console.log({fileUploadProps: this.props});
    if(this.props.files && this.props.docsReady) {
      let file = Images.findOne({_id: this.props.image});

      return (
        <FileUploadContainer>
          <Input type='file' disabled={this.state.inProgress} onChange={this.handleUpload} width={this.props.width} />
          <Progress attached='bottom' percent={this.state.progress} color={this.state.color} />
        </FileUploadContainer>
      );

    } else {
      return(
        <Loader />
      );
    }
  }
}

//
// This is the HOC - included in this file just for convenience, but usually kept
// in a separate file to provide separation of concerns.
//
export default withTracker( ( props ) => {
  const filesHandle = Meteor.subscribe('images');

  return {
    docsReady: filesHandle.ready(),
    files: Images.find({}).fetch(),
  }
})(FileUpload);
