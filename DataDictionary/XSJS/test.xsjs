//**** Example for basic REQUEST RESPONSE handling
var paramName; var paramValue; var headerName; var headerValue; var contentType;
var body = '';  var result_list = []; var res_val = {}; var result_query;
var query_exec; var tablename; var get_details; var columnArray=[] ; var get_primary ; var primaryKeyArray = [];
var i ;	var indx;	var Result ;

//Implementation of GET call
function handleGet() {
	
	// get request parameters from URL   
	var schmname = $.request.parameters.get("SCHEMANAME");
	var tblname = $.request.parameters.get("TABLENAME");
	var vwname = $.request.parameters.get("VIEWNAME");
	var lmt = $.request.parameters.get("LIMIT");
	var cndt = $.request.parameters.get("CONDITION");
	var oprtn = $.request.parameters.get("OPRTN");
	
	
	
	try
	{
		if( schmname !== undefined || tblname !== undefined )
		{
		// get connection to DataBase
		var conn = $.db.getConnection();
		
		// set schema and table name   
			var tablename = '"'+schmname+'"'+'.'+'"'+tblname+'"';
			var whereClause = 'SCHEMA_NAME = \''+schmname+'\' and TABLE_NAME = ' + '\''+tblname+'\'';
		//	"SCHEMA_NAME" = '_SYS_BIC' and "TABLE_NAME" = 'CUSTOMERS'
			
			get_primary = 'select COLUMN_NAME from sys.constraints where ' + whereClause ;
			
	        query_exec = conn.prepareCall(get_primary);
			query_exec.execute();
			
			result_query=query_exec.getResultSet();

			while(result_query.next()){
			    primaryKeyArray.push(result_query.getString(1));
			}
			
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
			
			Result = {values:result_list,primarykey:primaryKeyArray};
		
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
	
	
	
	
	// Retrieve data here and return results in JSON/other format 
	$.response.status = $.net.http.OK;
	 return Result;
}
//Implementation of POST call
function handlePost() {
	var bodyStr = $.request.body.asString(); // $.request.body ? $.request.body.asString() : undefined;
	if ( bodyStr === undefined ){
		 $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		 return {"myResult":"Missing BODY"};
	}
	// Extract body insert data to DB and return results in JSON/other format
	$.response.status = $.net.http.CREATED;
    return bodyStr; //{"myResult":"POST success"};
}
// Check Content type headers and parameters
function validateInput() {
/*	var i; var j;
	// Check content-type is application/json
	contentType = $.request.contentType;
	if ( contentType === null || contentType.startsWith("application/json") === false){
		 $.response.status = $.net.http.INTERNAL_SERVER_ERROR;
		 $.response.setBody("Wrong content type request use application/json");
		return false;
	}
	// Extract parameters and process them 
	for (i = 0; i < $.request.parameters.length; ++i) {
	    paramName = $.request.parameters[i].name;
	    paramValue = $.request.parameters[i].value;
//      Add logic	    
	}
	// Extract headers and process them 
	for (j = 0; j < $.request.headers.length; ++j) {
	    headerName = $.request.headers[j].name;
	    headerValue = $.request.headers[j].value;
//      Add logic	    
	 }*/
	return true;
}
// Request process  
function processRequest(){
	if (validateInput()){
		try {
		    switch ( $.request.method ) {
		        //Handle your GET calls here
		        case $.net.http.GET:
		            $.response.setBody(JSON.stringify(handleGet()));
		            break;
		            //Handle your POST calls here
		        case $.net.http.POST:
		            $.response.setBody(JSON.stringify(handlePost()));
		            break; 
		        case $.net.http.PUT:
		            $.response.status = $.net.http.FOUND;
		            $.response.setBody("Put request method");	
		            break;  
		        case $.net.http.DELETE:
		            $.response.setBody(JSON.stringify(handlePost()));
		            break; 
		        //Handle your other methods: PUT, DELETE
		        default:
		            $.response.status = $.net.http.METHOD_NOT_ALLOWED;
		            $.response.setBody("Wrong request method");		        
		            break;
		    }
		    //$.response.setBody($.request.method);
		    $.response.contentType = "application/json";	    
		} catch (e) {
		    $.response.setBody("Failed to execute action: " + e.toString());
		}
	}
}
// Call request processing  
processRequest();