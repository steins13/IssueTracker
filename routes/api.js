'use strict';

module.exports = function (app) {

  //EDIT STARTS HERE ! ! !
  const mongoose = require('mongoose');
  mongoose.connect(process.env.DB, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false }) 
    .then(() => {
      console.log("MongoDB connected")
    }) 
    .catch((err) => console.log(err));

  let issueSchema = new mongoose.Schema({
    issueName: String,
    issue_title: String,
    issue_text: String,
    created_by: String,
    assigned_to: String,
    status_text: String,
    created_on: String,
    updated_on: String,
    open: Boolean
  })

  let Issue = new mongoose.model("Issue", issueSchema);


  app.route('/api/issues/:project')
  
    //GET
    .get(function (req, res){
      let project = req.params.project;
      let filters = {issueName: project}
      let queries = [req.query._id, req.query.issue_title, req.query.issue_text, req.query.created_by, req.query.assigned_to, req.query.status_text, req.query.open]
      for (let i = 0; i <= queries.length - 1; i++) {
        if (queries[i] !== undefined) {
          if (i === 0) {
            filters._id = queries[i]
          } else if (i === 1) {
            filters.issue_title = queries[i]
          } else if (i === 2) {
            filters.issue_text = queries[i]
          } else if (i === 3) {
            filters.created_by = queries[i]
          } else if (i === 4) {
            filters.assigned_to = queries[i]
          } else if (i === 5) {
            filters.status_text = queries[i]
          } else if (i === 6) {
            filters.open = queries[i]
          }
        }
      }
      Issue.find(filters).select("-issueName -__v").exec((err, doc) => {
        if (err) {
          return console.log(err)
        }
        return res.json(doc)
      })
      return 0;
    })
    
    //POST 
    .post(function (req, res){
      let project = req.params.project;
      let issue = new Issue({
        issueName: project,
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || "",
        status_text: req.body.status_text || "",
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      })
    
      if (req.body.issue_title === undefined || req.body.issue_text === undefined || req.body.created_by === undefined) {
        return res.json({error: "required field(s) missing"})
      }
      issue.save();
      return res.json(issue)
    })

    //PUT
    .put(function (req, res){
      let project = req.params.project;

      let updates = {}
      Object.keys(req.body).forEach((key) => {
        if (key !== '') {
          updates[key] = req.body[key]
        }
      })

      Issue.findByIdAndUpdate(req.body._id, updates, {new: true}, (err, doc) => {
        if (err) {
          return res.json({error: "could not update", _id: req.body._id})
        }
        if (Object.keys(updates).length === 1) {
          return res.json({error: "no update field(s) sent", _id: req.body._id})
        } else if (req.body._id === undefined) {
          return res.json({error: "missing _id"});
        } else if (doc === null) {
          return res.json({error: "could not update", _id: req.body._id})
        }

        setTimeout(() => {
          Issue.findByIdAndUpdate(req.body._id, {updated_on: new Date()}, {new: true}, (err, doc) => {
            if (err) {
              return console.log(err)
            }
            return res.json({result: "successfully updated", _id: req.body._id});
          })
        }, 1000)

      })
    })
    
    //DELETE
    .delete(function (req, res){
      let project = req.params.project;

      if (req.body._id === undefined) {
        return res.json({error: "missing _id"});
      }
      Issue.findByIdAndRemove(req.body, (err, doc) => {
        if (err) {
          return res.json({error: "could not delete", _id: req.body._id})
        }
        if (doc === null) {
          return res.json({error: "could not delete", _id: req.body._id})
        }
        return res.json({result: "successfully deleted", _id: req.body._id})
      })
    });
};
