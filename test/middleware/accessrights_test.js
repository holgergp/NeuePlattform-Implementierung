"use strict";

var conf = require('../configureForTest');
var accessrights = conf.get('beans').get('accessrights');
var expect = require('chai').expect;

function createAccessrightsWithAdminSetTo(isAdmin, member) {
  var memberOfUser = member || {isAdmin: isAdmin};
  var req = { isAuthenticated: function () { return true; }, user: {member: memberOfUser} };
  var res = { locals: {} };
  accessrights(req, res, function () {});
  return res.locals.accessrights;
}

function guest() {
  var req = {  };
  var res = { locals: {} };
  accessrights(req, res, function () {});
  return res.locals.accessrights;
}

function standardMember(member) {
  return createAccessrightsWithAdminSetTo(false, member);
}

function admin(member) {
  return createAccessrightsWithAdminSetTo(true, member);
}

describe('Accessrights for Activities', function () {
  it('disallows the creation for non-admins', function () {
    expect(!!standardMember().canCreateActivity()).to.be.false;
  });

  it('allows the creation for admins', function () {
    expect(admin().canCreateActivity()).to.be.true;
  });

  it('disallows editing for non-admins', function () {
    expect(!!standardMember().canEditActivity()).to.be.false;
  });

  it('allows editing for admins', function () {
    expect(admin().canEditActivity()).to.be.true;
  });

  it('disallows registration for guests', function () {
    expect(!!guest().canParticipateInActivity()).to.be.false;
  });

  it('allows registration for non-admins', function () {
    expect(standardMember().canParticipateInActivity()).to.be.true;
  });

  it('allows registration for admins', function () {
    expect(admin().canParticipateInActivity()).to.be.true;
  });
});

describe('Accessrights for Announcements', function () {
  it('disallows the creation for non-admins', function () {
    expect(!!standardMember().canCreateAnnouncement()).to.be.false;
  });

  it('allows the creation for admins', function () {
    expect(admin().canCreateAnnouncement()).to.be.true;
  });

  it('disallows editing for non-admins', function () {
    expect(!!standardMember().canEditAnnouncement()).to.be.false;
  });

  it('allows editing for admins', function () {
    expect(admin().canEditAnnouncement()).to.be.true;
  });
});

describe('Accessrights for Groups', function () {
  it('disallows the creation for non-admins', function () {
    expect(!!standardMember().canCreateGroup()).to.be.false;
  });

  it('allows the creation for admins', function () {
    expect(admin().canCreateGroup()).to.be.true;
  });

  it('disallows editing for non-admins', function () {
    expect(!!standardMember().canEditGroup()).to.be.false;
  });

  it('allows editing for admins', function () {
    expect(admin().canEditGroup()).to.be.true;
  });

  it('disallows guest to view group details', function () {
    expect(!!guest().canViewGroupDetails()).to.be.false;
  });

  it('allows every registered member to view group details', function () {
    expect(standardMember().canViewGroupDetails()).to.be.true;
  });

  it('disallows guest to participate in a group', function () {
    expect(!!guest().canParticipateInGroup()).to.be.false;
  });

  it('allows every registered member to participate in a group', function () {
    expect(standardMember().canParticipateInGroup()).to.be.true;
  });
});

describe('Accessrights for Colors', function () {
  it('disallows the creation for non-admins', function () {
    expect(!!standardMember().canCreateColor()).to.be.false;
  });

  it('allows the creation for admins', function () {
    expect(admin().canCreateColor()).to.be.true;
  });
});

describe('Accessrights for Members', function () {
  it('disallows editing for non-admins', function () {
    var member = {id: 'id'};
    var otherMember = {id: 'other'};
    expect(!!standardMember(member).canEditMember(otherMember)).to.be.false;
  });

  it('allows editing herself for non-admins', function () {
    var member = {id: 'id'};
    expect(!!standardMember(member).canEditMember(member)).to.be.true;
  });

  it('disallows editing for admins', function () {
    var member = {isAdmin: true, id: 'id'};
    var otherMember = {id: 'other'};
    expect(admin(member).canEditMember(otherMember)).to.be.false;
  });

  it('allows editing for superusers', function () {
    // 'superuserID' is set in configureForTest as one valid superuser Id
    var member = {id: 'superuserID'};
    var otherMember = {id: 'other'};
    expect(standardMember(member).canEditMember(otherMember)).to.be.true;
  });
});

