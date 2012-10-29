//rest services for dynamic credit reporter
/*var mysql = require('mysql');
var TEST_DATABASE = 'javatest';
var TEST_TABLE = 't_usr';
var client = mysql.createClient({
	host : 'localhost',
	port  : 3306,
	user: 'java',
	password: 'javaUser',
	database: 'javatest'
});*/

var sqlite3 = require('sqlite3');

var db = new sqlite3.Database('test.db');

/*var mysqlConn = mysql.createConnection({
	host : 'localhost',
	port  : 3306,
	user: 'java',
	password: 'javaUser',
	database: 'javatest'
});*/

//client.query('USE '+TEST_DATABASE);

//a rest service that will return a json array of companies matching a search criteria
exports.company_search = function(req,res)
{
	//console.log(req.query.query);
	var co_nme_search_param = req.query.query;
	var co_nme_search_query = 'select duns id,co_nme name from t_company_data where co_nme like \'%' + co_nme_search_param + '%\' order by co_nme limit 0,20 ' ;
	/*client.query(co_nme_search_query,function(err, rows)
	{ 
		console.log('in search callback');
		if(err)
		{
			console.log(err);
		}
		res.json(rows,{ 'Content-Type': 'application/json'});
		
		//res.send(rows);
	
	} );*/
	db.all(co_nme_search_query,function(err,rows) 
					{
							if(err)
								console.log(err);
							//else
								//console.log(rows);
								
							res.json(rows,{ 'Content-Type': 'application/json'});	
					}
		);
	//client.end();
}

// a rest service that will generate the the company report for the selected company and render comp_rep.jade
exports.company_report = function(req,res)
{
	console.log('Generating report for DUNS:' + req.query.duns);
	var duns_num = req.query.duns;
	var comp_rep_query = 'select upper(co_nme) co_nme,duns,prim_addr_1,prim_addr_2,prim_city,prim_st,post_cd,ctry_nme,phon from t_company_data where duns = ' + duns_num;
	var co_nme = '';
	
	/*client.query(comp_rep_query,function(err, rows)
	{ 
		console.log('in report callback');
		if(err)
		{
			console.log(err);
		}
		else
		{
			
			console.log(rows);
			co_nme = rows[0].co_nme;
			console.log(co_nme);
			res.render('comp_rep',{comp_name : co_nme});
			//res.render('comp_rep',{});
		}
		
		
		//res.send(rows);
	
	} );*/
	db.all(comp_rep_query,function(err,rows) 
					{
							if(err)
								console.log(err);
							//else
								//console.log(rows);
								
								//co_nme = rows[0].co_nme;
								//console.log(rows[0].DUNS);
								res.render('comp_rep_v7',{
																	comp_name : rows[0].co_nme,
																	duns_nbr : rows[0].DUNS,
																	addr_1 : rows[0].PRIM_ADDR_1 == 'NULL' ?  '' : rows[0].PRIM_ADDR_1 ,
																	addr_2 : rows[0].PRIM_ADDR_2 == 'NULL' ?  '' : rows[0].PRIM_ADDR_2 ,
																	city : rows[0].PRIM_CITY == 'NULL' ?  '' : rows[0].PRIM_CITY ,
																	state : rows[0].PRIM_ST == 'NULL' ?  '' : rows[0].PRIM_ST ,
																	zip : rows[0].POST_CD == 'NULL' ?  '' : rows[0].POST_CD ,
																	ctry : rows[0].CTRY_NME == 'NULL' ?  '' : rows[0].CTRY_NME ,
																	ph_num : rows[0].PHON == 'NULL' ?  '' : rows[0].PHON,
																	ccs : Math.floor((Math.random()*5)+1),
																	fss : Math.floor((Math.random()*5)+1)
																} );
					}
		);
		
	//res.partial({comp_ln_name: 'Test Company',comp_description:'Test Description'});	
	//res.partial( 'partials/ln_profile',{comp_ln_name: 'Test Company',comp_description:'Test Description'});	
	//	client.end();
	
}


