import { Meteor } from 'meteor/meteor';
import React from 'react';
import { Button, Header, Modal, Form, Input } from 'semantic-ui-react';

import { Themes } from '/imports/api';
import { ThemeMethods } from '/imports/api/methods';

export default class NewThemeModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      modalOpen: false,
      newThemeTitle: "",
      newThemeQuestion: "",
      newThemeQuarter: ""
    }

    this.createNewTheme = this.createNewTheme.bind(this);
    this.inputStateChange = this.inputStateChange.bind(this);
  }

  handleOpen = () => this.setState({ modalOpen: true });

  handleClose = () => this.setState({ modalOpen: false });

  createNewTheme(e) {
    e.preventDefault();

    let theme = ThemeMethods.create.call({
      title: this.state.newThemeTitle,
      question: this.state.newThemeQuestion,
      quarter: this.state.newThemeQuarter
    }, (err, res) => {
      if(err) {
        console.error(err);
      } else {
        this.handleClose();
      }
    });
  }

  inputStateChange(e) {
    let input = e.target;
    //TODO: validate input
    this.setState({[input.id]: input.value});
  }

  render() {
    return (
      <Modal trigger={<Button onClick={this.handleOpen}>+ New Theme</Button>} centered={false} open={this.state.modalOpen} onClose={this.handleClose}>
        <Modal.Header>Create New Battery Powered Theme</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Form onSubmit={this.createNewTheme}>
              <Form.Field>
                <label htmlFor="newThemeTitle">Battery Powered Theme Title</label>
                <Input placeholder='e.g. Conservation' id="newThemeTitle" value={this.state.newThemeTitle} onChange={this.inputStateChange} />
              </Form.Field>
              <Form.Field>
                <label htmlFor="newThemeQuestion">Theme Question</label>
                <Input placeholder='e.g.' id="newThemeQuestion" value={this.state.newThemeQuestion} onChange={this.inputStateChange} />
              </Form.Field>
              <Form.Field>
                <label htmlFor="newThemeQuarter">Fiscal Quarter</label>
                <Input placeholder='e.g. 2018Q3' id="newThemeQuarter" value={this.state.newThemeQuarter} onChange={this.inputStateChange} />
              </Form.Field>
              <Button type='submit'>Save New Theme</Button>
            </Form>
          </Modal.Description>
        </Modal.Content>
      </Modal>
    );
  }
}
