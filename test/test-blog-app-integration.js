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
  return BlogPosts.insertMany(seedData);
}

