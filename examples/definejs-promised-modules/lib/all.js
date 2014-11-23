define([
    'promiseModules/mainPromise',
    'promiseModules/qPromise',
    'promiseModules/rsvpPromise',
    'promiseModules/jqueryPromise'
  ],
  function (mainPromise, qPromise, rsvpPromise, jqueryPromise) {


    console.log('main conf file successfully got loaded [as a promise module]:', mainPromise);

    console.log('Q conf file successfully got loaded [as a promise module]:', qPromise);

    console.log('RSVP conf file successfully got loaded [as a promise module]:', rsvpPromise);

    console.log('jQuery conf file successfully got loaded [as a promise module]:', jqueryPromise);

    return {
      mainPromise: mainPromise,
      qPromise: qPromise,
      rsvpPromise: rsvpPromise,
      jqueryPromise: jqueryPromise
    };

  });
