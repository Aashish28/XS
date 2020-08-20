//* Variables declaration 
var body = '';  var result_list = []; var res_val = {}; var result_query;
var query_exec; var tablename; var get_details; var columnArray=[];
var i ;	var indx;		

// get request parameters from URL   
var schmname = $.request.parameters.get("SCHEMANAME");
var tblname = $.request.parameters.get("TABLENAME");
var vwname = $.request.parameters.get("VIEWNAME");
var lmt = $.request.parameters.get("LIMIT");
var cndt = $.request.parameters.get("CONDITION");

try
{
	if( schmname !== undefined || tblname !== undefined )
	{
	// get connection to DataBase
	var conn = $.db.getConnection();
	
	// set schema and table name   
		var tablename = '"'+schmname+'"'+'.'+'"'+tblname+'"';
		
	// set condition in query if pass    
		if( cndt === undefined){
			get_details = 'select * from ' + tablename ;
		}
		else{
			get_details = 'select * from ' + tablename + ' where ' + cndt ;
		}
		
	// set limit in query if pass    
		if( lmt !== undefined){
			get_details = get_details + ' limit ' + lmt;
		}
		
		query_exec = conn.prepareCall(get_details);
		query_exec.execute();
		
		 result_query=query_exec.getResultSet();
		 
		 for(i=1;i<=result_query.getMetaData().getColumnCount();i++){
			 columnArray.push(result_query.getMetaData().getColumnName(i));
		 }
		 
		while(result_query.next())
		{
			indx = 0;
			res_val = {};
			while(columnArray.length !== indx){
			indx++;
			res_val[columnArray[indx-1]] =  result_query.getString(indx);
			}
			result_list.push(res_val);
			
		}
	
	body += JSON.stringify(result_list);
	
	conn.commit();
	conn.close();
	}
	else{
		body = 'Schema Name and Table Name is mandatory parameter';
	}
}
catch(e)
{
	body += "Failed to execute action:---"+e.toString()+"-----";	
	body += "Failed to execute action:---"+e.message+"-----";	
}

$.response.status = $.net.http.OK;
$.response.setBody(body);