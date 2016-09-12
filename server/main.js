Meteor.startup(function () {
  // insert a document if there isn't one already
  if (!Documents.findOne()){// no documents yet!
      Documents.insert({title:"my new document"});
  }
});

// request server to publish the documents
Meteor.publish("documents", function() {
  return Documents.find({
    $or: [ //  or filter
      {isPrivate:{$ne:true}}, // $ne = not equale to
      {owner:this.userId}
    ]
  });
})
// request server to publish the editing users
Meteor.publish("editingUsers", function() {
  return EditingUsers.find();
})
  
Meteor.publish("comments", function() {
  return Comments.find();
})
  