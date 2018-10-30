import { Meteor } from 'meteor/meteor';
import { FilesCollection } from 'meteor/ostrio:files';

let config = {
  collectionName: 'images',
  allowClientCode: false, // Disallow remove files from Client
  onBeforeUpload(file) {
    // Allow upload files under 10MB, and only in png/jpg/jpeg/gif formats
    if (file.size <= 10485760 && /png|jpg|jpeg|gif/i.test(file.extension)) {
      return true;
    }
    return 'Please upload image, with size equal or less than 10MB';
  }
}

if(Meteor.isServer){
  config.storagePath = process.env.PWD+'/public/uploads';
}

const Images = new FilesCollection(config);

// Images.attachSchema(FilesCollection.schema);

if (Meteor.isServer) {
  /* Allow all
   * @see http://docs.meteor.com/#/full/allow
   */
  Images.allowClient();

  /* Allow per action
   * @see http://docs.meteor.com/#/full/allow
   */
  // Images.allow({
  //   insert: function() {
  //     return true;
  //   },
  //   update: function() {
  //     return true;
  //   },
  //   remove: function() {
  //     return true;
  //   }
  // });
}

export { Images };
