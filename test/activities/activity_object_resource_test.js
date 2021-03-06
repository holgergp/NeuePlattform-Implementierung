"use strict";

require('../configureForTest');
var conf = require('nconf');
var expect = require('chai').expect;

//var util = require('util');

var Activity = conf.get('beans').get('activity');

var defaultName = 'Veranstaltung';

describe('Activity resource management', function () {

  describe('- on creation -', function () {

    it('creates the default resource (in compatibility mode)', function (done) {
      var activity = new Activity({url: 'myURL', registeredMembers: ['memberID']});

      expect(activity.registeredMembers(defaultName)).to.contain('memberID');
      done();
    });

    it('lists the name of the default resource if no resources are present on creation', function (done) {
      var activity = new Activity();

      expect(activity.resourceNames().length).to.equal(1);
      expect(activity.resourceNames()).to.contain(defaultName);
      done();
    });

    it('lists the name of all resources if resources are present on creation', function (done) {
      var activity = new Activity({resources: {Einzelzimmer: { _registeredMembers: []}, Doppelzimmer: { _registeredMembers: []}}});

      expect(activity.resourceNames().length).to.equal(2);
      expect(activity.resourceNames()).to.contain('Einzelzimmer');
      expect(activity.resourceNames()).to.contain('Doppelzimmer');
      done();
    });

    it('ignores resources that do not contain something valid on creation', function (done) {
      var activity = new Activity({resources: {Einzelzimmer: null, Doppelzimmer: undefined, Heuboden: ""}});

      expect(activity.resourceNames()).to.be.empty;
      done();
    });

    it('adds a default resource if there is no resources property in the activity', function (done) {
      var activity = new Activity({});

      expect(activity.resourceNames().length).to.equal(1);
      expect(activity.resourceNames()).to.contain(defaultName);
      done();
    });

    it('adds no default resource if there are no resources in the activity resources property', function (done) {
      var activity = new Activity({ resources: {}});

      expect(activity.resourceNames()).to.be.empty;
      expect(!!activity.resourceNames()).to.be.true; // not undefined, not null
      done();
    });
  });

  describe('- when adding members -', function () {

    it('adds a member to the default resource', function (done) {
      var activity = new Activity();

      activity.addMemberId('memberID', defaultName);

      expect(activity.registeredMembers(defaultName)).to.contain('memberID');
      done();
    });

    it('adds a member to a desired resource', function (done) {
      var activity = new Activity({url: 'myURL', resources: {Einzelzimmer: { _registeredMembers: []}, Doppelzimmer: { _registeredMembers: []}}});

      activity.addMemberId('memberID', 'Einzelzimmer');

      expect(activity.registeredMembers('Einzelzimmer')).to.contain('memberID');
      expect(activity.registeredMembers('Doppelzimmer')).to.be.empty;
      done();
    });

    it('does not do anything if the desired resource does not exist', function (done) {
      var activity = new Activity(
        {url: 'myURL', resources: {
          default: { _registeredMembers: ['memberID']}
        }});

      activity.addMemberId('memberID', 'Einzelzimmer');

      expect(activity.resourceNames().length).to.equal(1);
      expect(activity.registeredMembers('default')).to.contain('memberID');
      done();
    });



  });

  describe('- when removing members -', function () {

    it('removes a registered member from the default resource (created in compatibility mode)', function (done) {
      var activity = new Activity({url: 'myURL', registeredMembers: ['memberID']});

      activity.removeMemberId('memberID', defaultName);

      expect(activity.registeredMembers(defaultName)).to.be.empty;
      done();
    });

    it('removes a registered member from a desired resource', function (done) {
      var activity = new Activity(
        {url: 'myURL', resources: {
          Einzelzimmer: { _registeredMembers: ['memberID']},
          Doppelzimmer: { _registeredMembers: ['memberID']}
        }});

      activity.removeMemberId('memberID', 'Doppelzimmer');

      expect(activity.registeredMembers('Einzelzimmer')).to.contain('memberID');
      expect(activity.registeredMembers('Doppelzimmer')).to.be.empty;
      done();
    });

    it('does not do anything if the desired resource does not exist', function (done) {
      var activity = new Activity(
        {url: 'myURL', resources: {
          default: { _registeredMembers: ['memberID']}
        }});

      activity.removeMemberId('memberID', 'Doppelzimmer');

      expect(activity.resourceNames().length).to.equal(1);
      expect(activity.registeredMembers('default')).to.contain('memberID');
      done();
    });



  });



  describe('- when querying registered members -', function () {

    it('returns no members if the desired resource does not exist', function (done) {
      var activity = new Activity();

      expect(activity.registeredMembers('Nicht Existente Ressource')).to.be.empty;
      done();
    });

  });

  describe('- when resetting an activity -', function () {

    it('resets id, url, members and dates for copied activity (original created from compatibility mode)', function (done) {
      var activity = new Activity({
        id: 'ID',
        title: 'Title',
        startDate: '4.4.2013',
        endDate: '5.4.2013',
        url: 'myURL',
        resources: { default: { _registeredMembers: ['memberID'] }}
      });

      activity = activity.resetForClone();

      expect(activity.registeredMembers('default')).to.be.empty;
      expect(activity.startDate()).to.not.equal('04.04.2013');
      expect(activity.endDate()).to.not.equal('05.04.2013');
      expect(!!activity.id()).to.be.false;
      expect(!!activity.url()).to.be.false;
      done();
    });

  });

  describe('- when copying an activity -', function () {

    it('does not copy a registered member from an existing activity', function (done) {
      // this constructor behaviour also affects loading of stored activities
      var activity = new Activity({url: 'url'});
      activity.addMemberId('memberID', defaultName);

      var copy = new Activity().copyFrom(activity);

      expect(copy.registeredMembers(defaultName)).to.be.empty;
      done();
    });

    it('does not copy a registered member in a non-default resource from an existing activity', function (done) {
      // this constructor behaviour also affects loading of stored activities
      var activity = new Activity({url: 'url'});
      activity.addMemberId('memberID', 'non-default');

      var copy = new Activity().copyFrom(activity);

      expect(copy.registeredMembers('non-default')).to.be.empty;
      done();
    });


    it('can add a new member to a copied activity', function (done) {
      var activity = new Activity({url: 'url'});
      activity.addMemberId('memberID', defaultName);

      var copy = new Activity().copyFrom(activity);
      copy.addMemberId('memberID2', defaultName);

      expect(copy.registeredMembers(defaultName)).to.contain('memberID2');
      done();
    });

    it('does not add a state property to any of its resources when copying', function (done) {
      var activity = new Activity({url: 'url'});
      activity.addMemberId('memberID', defaultName);

      var copy = new Activity().copyFrom(activity);

      expect(copy.state.resources[defaultName].state).to.be.undefined;
      done();
    });

    it('preserves all resources of a copied activity (i.e. the copy accepts registrations for the resources)', function (done) {
      var activity = new Activity({url: 'url', resources: {
        Einzelzimmer: { _registeredMembers: []},
        Doppelzimmer: { _registeredMembers: []}
      }});

      var copy = new Activity().copyFrom(activity);
      copy.addMemberId('memberID2', 'Einzelzimmer');
      copy.addMemberId('memberID3', 'Doppelzimmer');

      expect(copy.registeredMembers('Einzelzimmer')).to.contain('memberID2');
      expect(copy.registeredMembers('Doppelzimmer')).to.contain('memberID3');
      done();
    });

    it('empties all resources of a copied activity', function (done) {
      var activity = new Activity({url: 'url', resources: {
        Einzelzimmer: { _registeredMembers: ['memberID']},
        Doppelzimmer: { _registeredMembers: ['memberID']}
      }});

      var copy = new Activity().copyFrom(activity);

      expect(copy.registeredMembers('Einzelzimmer')).to.be.empty;
      expect(copy.registeredMembers('Doppelzimmer')).to.be.empty;

      done();
    });

    it('keeps the original ressource intact after copying', function (done) {
      var activity = new Activity({url: 'url', resources: {
        Einzelzimmer: { _registeredMembers: ['memberID']},
        Doppelzimmer: { _registeredMembers: ['memberID']}
      }});

      new Activity().copyFrom(activity);

      expect(activity.registeredMembers('Einzelzimmer')).to.contain('memberID');
      expect(activity.registeredMembers('Doppelzimmer')).to.contain('memberID');

      done();
    });

    it('copies the limits of all resources', function (done) {
      var activity = new Activity({url: 'url', resources: {
        Teilnehmer: { _registeredMembers: [], _limit: 10},
        Einzelzimmer: { _registeredMembers: [], _limit: 20},
        Doppelzimmer: { _registeredMembers: [], _limit: 30}
      }});

      var copy = new Activity().copyFrom(activity);

      expect(copy.numberOfFreeSlots('Teilnehmer')).to.equal(10);
      expect(copy.numberOfFreeSlots('Einzelzimmer')).to.equal(20);
      expect(copy.numberOfFreeSlots('Doppelzimmer')).to.equal(30);
      done();
    });


  });

  describe('- when querying registered members -', function () {

    it('lists no registered members if there are no resources', function (done) {
      var activity = new Activity({ resources: {}});

      expect(activity.allRegisteredMembers()).to.be.empty;
      done();
    });

    it('lists all registered members of any resource', function (done) {
      var activity = new Activity({ resources: {
        default: { _registeredMembers: ['memberID1']},
        Einzelzimmer: { _registeredMembers: ['memberID2']},
        Doppelzimmer: { _registeredMembers: ['memberID3']}
      }});

      expect(activity.allRegisteredMembers().length).to.equal(3);
      expect(activity.allRegisteredMembers()).to.contain('memberID1');
      expect(activity.allRegisteredMembers()).to.contain('memberID2');
      expect(activity.allRegisteredMembers()).to.contain('memberID3');
      done();
    });

    it('lists a registered member only once even when he registered for multiple resources', function (done) {
      var activity = new Activity({ resources: {
        default: { _registeredMembers: ['memberID']},
        Einzelzimmer: { _registeredMembers: ['memberID']},
        Doppelzimmer: { _registeredMembers: ['memberID']}
      }});

      expect(activity.allRegisteredMembers().length).to.equal(1);
      expect(activity.allRegisteredMembers()).to.contain('memberID');
      done();
    });

  });

});
