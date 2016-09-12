// methods that provide edit & write access to the data
Meteor.methods({
  addComment:function(comment) {
    console.log("add comment method running");
    console.log(comment);
    if (this.userId) {
      // comment.createdOn = new Date();
      comment.owner = this.userId;
      return Comments.insert(comment);
    }
    else {
      alert("You need to login");
    }
    return;
  },
  addDoc:function() {
    var doc;
    if (!this.userId) { // not logged in
      return;
    } 
    else {
      doc = {
        owner:this.userId, 
        createdOn: new Date(),
        title: "my new doc"
      };
      var id = Documents.insert(doc);
      console.log("addDoc method: got an id: "+id);
      return id;
    }
  },
  updateDocPrivacy:function(doc) {
    console.log("updatePrivacy ");
    console.log(doc);
    var realDoc = Documents.findOne({_id:doc._id, owner:this.userId});
    if (realDoc) {
      realDoc.isPrivate = doc.isPrivate;
      Documents.update({_id:doc._id}, realDoc);
    }
  },
  // allows changes to the editing users collection 
  addEditingUser:function(documentid){
    var doc, user, eusers;
    doc = Documents.findOne({_id:documentid});
    if (!doc){return;}// no doc give up
    if (!this.userId){return;}// no logged in user give up
    // now I have a doc and possibly a user
    user = Meteor.user().profile;
    eusers = EditingUsers.findOne({docid:doc._id});
    if (!eusers){// no editing users have been stored yet
      eusers = {
        docid:doc._id, 
        users:{}, 
      };
    }
    user.lastEdit = new Date();
    eusers.users[this.userId] = user;
    // upsert- insert or update if filter matches
    EditingUsers.upsert({_id:eusers._id}, eusers);
  }
})
