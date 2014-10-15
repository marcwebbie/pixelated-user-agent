/*global Pixelated */

describeComponent('mail_view/data/mail_sender', function () {
  'use strict';

  var mailBuilder;
  var mail;

  beforeEach(function () {
    mailBuilder =  require('mail_view/data/mail_builder');
    mail = Pixelated.testData().parsedMail.simpleTextPlain;
    setupComponent();
  });

  it('sends mail data with a POST to the server when asked to send email', function() {
    var mailSentEventSpy = spyOnEvent(document, Pixelated.events.mail.sent);
    var g;

    spyOn($, 'ajax').andReturn({done: function(f) { g = f; return {fail: function(){}};}});

    this.component.trigger(Pixelated.events.mail.send, mail);

    g();

    expect(mailSentEventSpy).toHaveBeenTriggeredOn(document);

    expect($.ajax.mostRecentCall.args[0]).toEqual('/mails');
    expect($.ajax.mostRecentCall.args[1].type).toEqual('POST');
    expect(JSON.parse($.ajax.mostRecentCall.args[1].data).header).toEqual(mail.header);
    expect(JSON.parse($.ajax.mostRecentCall.args[1].data).body).toEqual(mail.body);
  });

  it('save draft data with a PUT to the server', function() {
    var draftSavedEventSpy = spyOnEvent(document, Pixelated.events.mail.draftSaved);
    var g;

    spyOn($, 'ajax').andReturn({done: function(f) { g = f; return {fail: function(){}};}});

    mail.ident = 0;
    this.component.trigger(Pixelated.events.mail.saveDraft, mail);

    g();

    expect(draftSavedEventSpy).toHaveBeenTriggeredOn(document);

    expect($.ajax.mostRecentCall.args[0]).toEqual('/mails');
    expect($.ajax.mostRecentCall.args[1].type).toEqual('PUT');
    expect(JSON.parse($.ajax.mostRecentCall.args[1].data).header).toEqual(mail.header);
    expect(JSON.parse($.ajax.mostRecentCall.args[1].data).body).toEqual(mail.body);
  });

  it('displays generic error message when sending an email fails in the service', function () {
    var deferred;
    deferred = $.Deferred();
    deferred.reject({responseJSON: {}}, 500, 'Internal Server Error');

    var messageEvent = spyOnEvent(document, Pixelated.events.ui.userAlerts.displayMessage);
    spyOn($, 'ajax').andReturn(deferred);

    this.component.trigger(Pixelated.events.mail.send, mail);

    expect(messageEvent).toHaveBeenTriggeredOnAndWith(document, {message: 'Ops! something went wrong, try again later.'});
  });

  it('displays error message returned by the service when sending an email fails in the service', function () {
    var deferred;
    deferred = $.Deferred();
    deferred.reject({responseJSON: {message: 'test: error message'}}, 422, 'Unprocessable Entity');

    var messageEvent = spyOnEvent(document, Pixelated.events.ui.userAlerts.displayMessage);
    spyOn($, 'ajax').andReturn(deferred);

    this.component.trigger(Pixelated.events.mail.send, mail);

    expect(messageEvent).toHaveBeenTriggeredOnAndWith(document, {message: 'Error sending mail: test: error message'});
  });
});
