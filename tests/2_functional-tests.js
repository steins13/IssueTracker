const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  

  // test("Test 1", (done) => {
  //   chai
  //     .request(server)
  //     .post("/api/issues/steins")
  //     .send({
  //       issue_title: 'Issue to be Deleted',
  //       issue_text: 'Functional Test - Delete target',
  //       created_by: 'fCC'
  //     })
  //     .end((err, res) => {
  //       console.log(res.body)
  //       assert.isObject(res.body);
  //       done();
  //     })
  // })

  // test("Test 2", (done) => {
  //   chai
  //     .request(server)
  //     .get("/api/issues/steins?_id=60ec05a6b6441056f82ef8b9")
  //     .end((err, res) => {
  //       console.log(res.body)
  //       assert.isArray(res.body);
  //       assert.isObject(res.body[0]);
  //       assert.isAbove(
  //         Date.parse(res.body[0].updated_on),
  //         Date.parse(res.body[0].created_on)
  //       );
  //       done();
  //     })
  // })

  // test("Test 3", (done) => {
  //   chai
  //     .request(server)
  //     .put("/api/issues/steins")
  //     .send({

  //     })
  //     .end((err, res) => {
  //       console.log(res.body)
  //       done();
  //     })
  // })

  // test("Test 4", (done) => {
  //   chai
  //     .request(server)
  //     .delete("/api/issues/steins")
  //     .send({
  //       _id: '5f665eb46e296f6b9b6a504d', 
  //       issue_text: 'New Issue Text'
  //     })
  //     .end((err, res) => {
  //       console.log(res.body)
  //       assert.isObject(res.body);
  //       assert.deepEqual(res.body, {
  //         error: 'could not delete',
  //         _id: '5f665eb46e296f6b9b6a504d'
  //       }); 
  //       done();
  //     })
  // })

  let idForDelete;

  test("Create an issue with every field", (done) => {
    chai
      .request(server)
      .post("/api/issues/steins")
      .send({
        issue_title: "titleTest1",
        issue_text: "textTest1",
        created_by: "creatorTest1",
        assigned_to: "assignTest1",
        status_text: "statusTest1"
      })
      .end((err, res) => {
        idForDelete = res.body._id;
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        done();
      })
  })

  test("Create an issue with only required fields", (done) => {
    chai
      .request(server)
      .post("/api/issues/steins")
      .send({
        issue_title: "titleTest1",
        issue_text: "textTest1",
        created_by: "creatorTest1"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');  
        done();
      })
  })

  test("Create an issue with missing required fields", (done) => {
    chai
      .request(server)
      .post("/api/issues/steins")
      .send({
        created_by: "creatorTest1"
      })
      .end((err, res) => {
        assert.isObject(res.body);
        assert.equal(res.body.error, "required field(s) missing");
        done();
      })
  })

  test("View issues on a project", (done) => {
    chai
      .request(server)
      .get("/api/issues/steins")
      .end((err, res) => {
        assert.isArray(res.body);
        assert.isObject(res.body[0]);
        done();
      })
  })

  test("View issues on a project with one filter", (done) => {
    chai
      .request(server)
      .get("/api/issues/steins?created_by=creatorTest1")
      .end((err, res) => {
        assert.isArray(res.body);
        assert.equal(res.status, 200);
        assert.equal(res.body[0].created_by, "creatorTest1");
        done();
      })
  })

  test("View issues on a project with multiple filters", (done) => {
    chai
      .request(server)
      .get("/api/issues/steins?created_by=creatorTest1&open=true")
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.equal(res.body[0].open, true);
        assert.equal(res.body[0].created_by, "creatorTest1");
        done();
      })
  })
  
  test("Update one field on an issue", (done) => {
    chai
      .request(server)
      .put("/api/issues/steins")
      .send({
        _id: "60ec115a5adfd425f89a6859",
        issue_title: "Title Updated"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {result: "successfully updated", _id: "60ec115a5adfd425f89a6859"});
        chai
          .request(server)
          .get("/api/issues/steins?_id=60ec115a5adfd425f89a6859")
          .end((err, res) => {
            assert.equal(res.body[0].issue_title, "Title Updated");
          })
        done();
      })
  })

  test("Update multiple fields on an issue", (done) => {
    chai
      .request(server)
      .put("/api/issues/steins")
      .send({
        _id: "60ec1144ddc3e635003426a4",
        issue_title: "Updated Title",
        issue_text: "Updated Text"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {result: "successfully updated", _id: "60ec1144ddc3e635003426a4"});
        chai
          .request(server)
          .get("/api/issues/steins?_id=60ec1144ddc3e635003426a4")
          .end((err, res) => {
            assert.equal(res.body[0].issue_title, "Updated Title");
            assert.equal(res.body[0].issue_text, "Updated Text");
          })
        done();
      })
  })

  test("Update an issue with missing _id", (done) => {
    chai
      .request(server)
      .put("/api/issues/steins")
      .send({})
      .end((err, res) => {
        assert.isObject(res.body);
        assert.deepEqual(res.body, {error: "missing _id"});
        assert.equal(res.status, 200);
        done();
      })
  })

  test("Update an issue with no fields to update", (done) => {
    chai
      .request(server)
      .put("/api/issues/steins")
      .send({
        _id: "60ec110687afc3602055b73b"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {error: "no update field(s) sent", _id: "60ec110687afc3602055b73b"});
        done();
      })
  })

  test("Update an issue with an invalid _id", (done) => {
    chai
      .request(server)
      .put("/api/issues/steins")
      .send({
        _id: "Not An Id",
        issue_title: "testTitle1"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {error: "could not update", _id: "Not An Id"});
        done();
      })
  })

  test("Delete an issue", (done) => {
    chai
      .request(server)
      .delete("/api/issues/steins")
      .send({
        _id: idForDelete
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {result: "successfully deleted", _id: idForDelete});
        chai
          .request(server)
          .get("/api/issues/steins?_id=" + idForDelete)
          .end((err, res) => {
            assert.lengthOf(res.body, 0);
          })
        done();
      })
  })

  test("Delete an issue with an invalid _id", (done) => {
    chai
      .request(server)
      .delete("/api/issues/steins")
      .send({
        _id: "Not an Id"
      })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {error: "could not delete", _id: "Not an Id"});
        done();
      })
  })

  test("Delete an issue with missing _id", (done) => {
    chai
      .request(server)
      .delete("/api/issues/steins")
      .send({})
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.isObject(res.body);
        assert.deepEqual(res.body, {error: "missing _id"});
        done();
      })
  })

  let fuckId;
  test("Fuck", (done) => {
    chai
      .request(server)
      .post("/api/issues/steins")
      .send({
        issue_title: 'Issue to be Updated',
        issue_text: 'Functional Test - Put target',
        created_by: 'fCC'
      })
      .end((err, res) => {
        fuckId = res.body._id
        chai
          .request(server)
          .put("/api/issues/steins")
          .send({
            _id: fuckId, 
            issue_text: 'New Issue Text'
          })
          .end((err, res) => {
            assert.isObject(res.body);
            assert.deepEqual(res.body, {result: 'successfully updated', _id: fuckId});
            chai
              .request(server)
              .get("/api/issues/steins?_id=" + fuckId)
              .end((err, res) => {
                assert.isArray(res.body);
                assert.isObject(res.body[0]);
                assert.isAbove(
                  Date.parse(res.body[0].updated_on),
                  Date.parse(res.body[0].created_on)
                );
              })
            done();
          })
      })
  })

});
