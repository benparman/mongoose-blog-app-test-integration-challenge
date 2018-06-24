'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');
const expect = chai.expect;
const {BlogPost} = require('../models'); // ".."" moves up one level, out of test and into root
const {app, runServer, closeServer} = require('../server');
const {TEST_DATABASE_URL} = require('../config');

chai.use(chaiHttp);

function seedBlogData() {
  console.info('seeding blog data');
  const seedData = [];
  for (let i=0; i<10; i++) {
    seedData.push({
      author: {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName()
      },
      title: faker.lorem.words(),
      content: faker.lorem.sentences()
    });
  }
  return BlogPost.insertMany(seedData);
}
function generateBlogData() {
  return {
    title: faker.lorem.words(),
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    content: faker.lorem.sentences(),
  };
}
function tearDownDb() {
  return new Promise((resolve, reject) => {
    console.warn('Deleting database');
    mongoose.connection.dropDatabase()
      .then(result => resolve(result))
      .catch(err => reject(err));
  });
}
describe('BlogPosts API Resource', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function() {
    return seedBlogData();
  });
  afterEach(function() {
    return tearDownDb();
  });
  after(function() {
    return closeServer();
  });
  describe('GET endpoint', function() {
    it('should return all existing blog posts', function() {
      let res;
      return chai.request(app)
        .get('/posts')
        .then(function(_res) {
          res = _res;
          // console.log("res, as defined by _res", res.body);
          expect(res).to.have.status(200);
          expect(res.body).to.have.lengthOf.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          expect(res.body).to.have.lengthOf(count);
        });
    });
    it('should return posts with the right fields', function() {
      let resPost;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a('array');
          expect(res.body).to.have.a.lengthOf.at.least(1);

          res.body.forEach(function(post) {
            expect(post).to.be.a('object');
            expect(post).to.include.keys(
              'id', 'author', 'content', 'title', 'created');
          });
          resPost = res.body[0];
          return BlogPost.findById(resPost.id);
        })
        .then(function(post) {
          console.log('post within function on line 100', post);
          console.log('resPost variable declared from line 97', resPost);
          expect(resPost.id).to.equal(post.id);
          expect(resPost.author).to.equal(post.authorName);
          //this may need to be changed to:
          //expect(resPost.author).to.contain)(post.author.firstName); OR
          //expect(resPost.author.firstName).to.equal(post.author.firstName)
          //and same for last name
          expect(resPost.content).to.equal(post.content);
          expect(resPost.title).to.equal(post.title);
        });
    });
  });
  describe('POST endpoint', function(){
    it('should add a new blog post', function() {
      const newPost = generateBlogData();
      return chai.request(app)
        .post('/posts')
        .send(newPost)
        .then(function(res) {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.include.keys(
            'id', 'author', 'content', 'title', 'created');
          expect(res.body.id).to.not.be.null;
          expect(res.body.content).to.equal(newPost.content);
          expect(res.body.title).to.equal(newPost.title);
          return BlogPost.findById(res.body.id);
        })
        .then(function(post) {
          expect(post.author.firstName).to.equal(newPost.author.firstName);
          expect(post.author.lastName).to.equal(newPost.author.lastName);
          expect(post.title).to.equal(newPost.title);
          expect(post.content).to.equal(newPost.content);
        });
    });
  });
  describe('PUT endpoint', function() {
    it('should update specified fields within a blog post', function() {
      const updateData = {
        title: 'UPDATED TITLE - PUT WORKED!',
        content: 'UPDATED CONTENT - PUT WORKED!'
      };
      return BlogPost
        .findOne()
        .then(function(blogpost) {
          updateData.id = blogpost.id;
          return chai.request(app)
            .put(`/posts/${blogpost.id}`)
            .send(updateData);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return BlogPost.findById(updateData.id);
        })
        .then(function(blogpost) {
          expect(blogpost.title).to.equal(updateData.title);
          expect(blogpost.content).to.equal(updateData.content);
        });
    });
  });
  describe('DELETE endpoint', function() {
    it('should delete a blog post by id', function() {
      let blogpost;
      console.log('LOGGING BlogPost ON LINE 171', BlogPost);
      console.log('BlogPost.FindOne() from Line 161', BlogPost.findOne());
      return BlogPost
        .findOne()
        .then(function(_blogpost) {
          blogpost = _blogpost;
          return chai.request(app).delete(`/posts/${blogpost.id}`);
        })
        .then(function(res) {
          expect(res).to.have.status(204);
          return BlogPost.findById(blogpost.id);
        })
        .then(function(_blogpost) {
          expect(_blogpost).to.be.null;
        });
    });
  });
});