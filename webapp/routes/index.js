
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express' });
};


/*
 * POST Authentication
 */

exports.auth = function(req, res) {
  res.json({success: true});
};
