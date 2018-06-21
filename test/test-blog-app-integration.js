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
    seedData.push(generateBlogData());
  }
  return BlogPost.insertMany(seedData);
}

function generateBlogData() {
  return {
    author: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName()
    },
    title: faker.lorem.words(),
    content: faker.lorem.sentences(),
    created: faker.date.past()
  };
}

function tearDownDb() {
  console.warn('Deleting database');
  return mongoose.connection.dropDatabase();
}

describe('BlogPosts API Resource', function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function() {
    return seedRestaurantData();
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
          expect(res).to.have.status(200);
          expect(res.body.posts).to.have.lengthOf.at.least(1);
          return BlogPost.count();
        })
        .then(function(count) {
          expect(res.body.posts).to.have.lengthOf(count);
        });
    });
    it('should return posts with the right fields', function() {
      let resPost;
      return chai.request(app)
        .get('/posts')
        .then(function(res) {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body.posts).to.be.a('array');
          expect(res.body.posts).to.have.a.lengthOf.at.least(1);

          res.body.posts.forEach(function(post) {
            expect(post).to.be.a('object');
            expect(post).to.include.keys(
              'id', 'author', 'content', 'title', 'created');
          });
          resPost = res.body.posts[0];
          return BlogPost.findById(resPost.id);
        })
        .then(function(post) {
          expect(resPost.id).to.equal(post.id);
          expect(resPost.author).to.equal(post.author);
          //this may need to be changed to:
          //expect(resPost.author).to.contain)(post.author.firstName); OR
          //expect(resPost.author.firstName).to.equal(post.author.firstName)
          //and same for last name
          expect(resPost.content).to.equal(post.content);
          expect(resPost.title).to.equal(post.title);
          expect(resPost.created).to.equal(post.created);
        });
    });
  });

  describe('POST endpoint', function(){
    //****************LEFT OFF HERE - INSERT IT STATEMENT!!!****************
    //****************LEFT OFF HERE - INSERT IT STATEMENT!!!****************
    //****************LEFT OFF HERE - INSERT IT STATEMENT!!!****************
    //****************LEFT OFF HERE - INSERT IT STATEMENT!!!****************
    //****************LEFT OFF HERE - INSERT IT STATEMENT!!!****************
    //****************LEFT OFF HERE - INSERT IT STATEMENT!!!****************
    //****************LEFT OFF HERE - INSERT IT STATEMENT!!!****************
    //****************LEFT OFF HERE - INSERT IT STATEMENT!!!****************
  });
});