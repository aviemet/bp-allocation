import React from 'react';

import { Grid, Button } from 'semantic-ui-react';

export default class IndividualFile extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.deleteFile = this.deleteFile.bind(this);
    this.renameFile = this.renameFile.bind(this);

  }

  deleteFile(){
    let conf = confirm('Are you sure you want to delete the file?') || false;
    if(conf) {
      Meteor.call('images.delete', this.props.fileId, (err, res) => {
        if (err)
          console.log(err);
      });
    }
  }

  renameFile(){
    let validName = /[^a-zA-Z0-9 \.:\+()\-_%!&]/gi;
    let prompt    = window.prompt('New file name?', this.props.fileName);

    // Replace any non valid characters, also do this on the server
    if(prompt) {
      prompt = prompt.replace(validName, '-');
      prompt.trim();
    }

    // if (!_.isEmpty(prompt)) {
    if(typeof prompt === 'string' && prompt !== ''){
      Meteor.call('images.rename', this.props.fileId, prompt, function (err, res) {
        if(err) console.log(err);
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Grid.Row>
          <Grid.Column>
            <strong>{this.props.fileName}</strong>
            <div className="m-b-sm">
            </div>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column>
            <Button onClick={this.renameFile}>Rename</Button>
          </Grid.Column>


          <Grid.Column>
            <a href={this.props.fileUrl} className="btn btn-outline btn-primary btn-sm"
               target="_blank">View</a>
          </Grid.Column>

          <Grid.Column>
            <Button onClick={this.deleteFile}>Delete</Button>
          </Grid.Column>

          <Grid.Column>
            Size: {this.props.fileSize}
          </Grid.Column>
        </Grid.Row>
      </React.Fragment>
    );
  }
}
