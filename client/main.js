// subscribe to the 2 collections
Meteor.subscribe("documents");
Meteor.subscribe("editingUsers");

///////////
//  helper's functions
//////////

// return the id of the first document you can find
Template.editor.helpers({
  docid:function(){
    setupCurrentDocument();
    return Session.get("docid");
    // var doc = Documents.findOne();
    // if (doc){
    //   return doc._id;
    // }
    // else {
    //   return undefined;
    // }
  },
  // configure the CodeMirror editor
  config:function(){
    return function(editor){
      editor.setOption("lineNumbers", true);
      editor.setOption("theme", "cobalt");
      // set a callback that gets triggered whenever the user
      // makes a change in the code editing window
      editor.on("change", function(cm_editor, info){
        // send the current code over to the iframe for rendering
        $("#viewer_iframe").contents().find("html").html(cm_editor.getValue());
        Meteor.call("addEditingUser", Session.get("docid"));
      });        
    }
  }, 
});

Template.editingUsers.helpers({
  // retrieve a set of users that are editing this document
  users:function(){
    var doc, eusers, users;
    doc = Documents.findOne({_id: Session.get("docid")});
    if (!doc){return;}// give up
    eusers = EditingUsers.findOne({docid:doc._id});
    if (!eusers){return;}// give up
    users = new Array();
    var i = 0;
    for (var user_id in eusers.users){
        users[i] = fixObjectKeys(eusers.users[user_id]);
        i++;
    }
    return users;
  }
})

Template.navbar.helpers({
  documents:function() {
    return Documents.find({}, {sort:{createdOn:-1}});
  }
})

Template.docMeta.helpers({
  document:function() {
    // return the current document
    return Documents.findOne({_id: Session.get("docid")});
  },
  canEdit:function() {
    var doc;
    doc = Documents.findOne({_id:Session.get("docid")});
    if (doc) {
      if (doc.owner == Meteor.userId()) {
        return true;
      }
    }
    return false;
  }
})

Template.editableText.helpers({
  userCanEdit: function() {
    // can edit if the current doc is owned by the current user
    doc = Documents.findOne({_id:Session.get("docid"), owner:Meteor.userId()})
    if (doc) {
      return true;
    }
    else {
      return false;
    }
  }
})

//  EVENTS

Template.navbar.events({
  "click .js-add-doc": function(event) {
    event.preventDefault();
    console.log("add a new doc");
    if (!Meteor.user()) { // user not logged in
      alert("You need to login first");
    }
    else {
      var id = Meteor.call("addDoc", function(err, res) {
        if (!err) {
          console.log("event callback received id: "+res);
          Session.set("docid", res);
        }
      });
      // console.log("event got an id back: "+id);
    }
  },
  "click .js-load-doc": function(event) {
    console.log(this);
    Session.set("docid", this._id);
  }
})

Template.docMeta.events({
  "click .js-tog-private": function(event) {
    console.log(event.target.checked);
    var doc = {_id: Session.get("docid"), isPrivate: event.target.checked};
    Meteor.call("updateDocPrivacy", doc);
    
  }
})

// helper functions needed by the client only
function setupCurrentDocument() {
  var doc;
  if(!Session.get("docid")) {
    doc = Documents.findOne();
    if (doc) {
      Session.set("docid", doc._id);
    }
  }
}

// this renames object keys by removing hyphens to make the compatible 
// with spacebars. 
function fixObjectKeys(obj){
  var newObj = {};
  for (key in obj){
    var key2 = key.replace("-", "");
    newObj[key2] = obj[key];
  }
  return newObj;
}