// Import Router configuration

const fetchData = require('./router.config.js')
    , conn = require('./../config/config.js').CONN
    , octokit = require('@octokit/rest')()
    , request = require('superagent')

fetchData.get('/fetchData/issues', (req, res)=>{
  console.log('fetchData route hit!');
  console.log(req.query);
  var data = req.query.repo.split('/')

  // octokit.paginate('GET /repos/shippable/support/issues', { owner: data[0], repo: data[1] })
  // .then(issues => {
  //   // issues is an array of all issue objects
  //   console.log('Printing Issues: ', issues);
  //   res.send('fetchData route working fine');
  // })
  // octokit.repos.getForOrg({
  //   org: 'octokit',
  //   type: 'public'
  // }).then(({ data, headers, status }) => {
  //   // handle data
  //   console.log(data);
  //   res.send('Hello')
  // })
  res.send('Work under Progress')
})

module.exports = fetchData;
