var connection = $.hdb.getConnection();

function createSqlStatement(currentRecords, OriginalRecords, tableName, columns) {

	var sqlstatement = "update " + tableName + " set ";
	for (var k = 0; k < columns.length; k++) {
		if (k != columns.length - 1) {
			sqlstatement = sqlstatement + columns[k] + "=" + "'" + currentRecords[columns[k]] + "'" + ",";
		} else {
			sqlstatement = sqlstatement + columns[k] + "=" + "'" + currentRecords[columns[k]] + "'" + " where ";

		}
	}

	for (var n = 0; n < columns.length; n++) {
		if (n != columns.length - 1) {
			sqlstatement = sqlstatement + columns[n] + "=" + "'" + OriginalRecords[columns[n]] + "'" + " AND ";
		} else {
			sqlstatement = sqlstatement + columns[n] + "=" + "'" + OriginalRecords[columns[n]] + "'";

		}
	}

	return sqlstatement;

}

function createInsertStatement(currentRecords, tableName, columns) {

	var sql = "insert into " + tableName + "(";
	for (var k = 0; k < columns.length; k++) {
		if (k != columns.length - 1) {
			sql = sql + columns[k] + ','
		} else {
			sql = sql + columns[k] + ') values('
		}
	}

	for (var n = 0; n < columns.length; n++) {
		if (n != columns.length - 1) {
			sql = sql + '\'' + currentRecords[columns[n]] + '\','
		} else {
			sql = sql + '\'' + currentRecords[columns[n]] + '\')'

		}
	}

	return sql;

}

function createDeleteStatement(originalRecords, tableName, columns) {

	var sqlstatement = "delete  from " + tableName + " where ";
	for (var k = 0; k < columns.length; k++) {
		if (k != columns.length - 1) {
			sqlstatement = sqlstatement + columns[k] + "=" + "'" + originalRecords[columns[k]] + "'" + " and ";
		} else {
			sqlstatement = sqlstatement + columns[k] + "=" + "'" + originalRecords[columns[k]] + "'";

		}
	}

	return sqlstatement;

}

function createDeleteAllStatement(filters, tableName, columns) {

	var sqlQuery = "delete  from " + tableName + " where ";
	for (var j = 0; j < columns.length; j++) {
		if (j < columns.length - 1) {
			var arr = filters[columns[j]].map(function(arr) {
				return arr = "'" + arr + "'"
			});
			var temQuery = columns[j] + ' in('
			for (var k = 0; k < arr.length; k++) {
				if (k < arr.length - 1)
					temQuery = temQuery + arr[k] + ',';
				else
					temQuery = temQuery + arr[k];
			}
			temQuery = temQuery + ')';
			sqlQuery = sqlQuery + temQuery + ' and ';
		} else {
			var arr = filters[columns[j]].map(function(arr) {
				return arr = "'" + arr + "'"
			});
			var temQuery = columns[j] + ' in('
			for (var k = 0; k < arr.length; k++) {
				if (k < arr.length - 1)
					temQuery = temQuery + arr[k] + ',';
				else
					temQuery = temQuery + arr[k];
			}
			temQuery = temQuery + ')';
			sqlQuery = sqlQuery + temQuery;
		}
	}

	return sqlQuery;

}

function createReadStatement(tableName,condition,limit,offset){
    var query;
    		if( condition === undefined){
				query = 'select * from ' + tableName ;
			}
			else{
				query = 'select * from ' + tableName + ' where ' + condition ;
			}
			
			// set limit in query if pass    
			if( limit !== undefined){
				query = query + ' limit ' + limit;
			}
			
			if( offset !== undefined ){
			    query = query + ' offset ' + offset;
			}
			
    return query;
}

function read(){
    var query_exec; var columnArray=[] ; var primaryKeyArray = [] ; var columnsMetadata = [];
    var Result ; var result_list = []; var res_val = {}; var i ;	var indx;
    
	var tableName = JSON.parse($.request.body.asString()).sTableName;
	var condition = JSON.parse($.request.body.asString()).condition;
	var limit = JSON.parse($.request.body.asString()).limit;
	var offset = JSON.parse($.request.body.asString()).offset;
	
	var sqlQuery = createReadStatement(tableName,condition,limit,offset);
	
                query_exec = connection.executeQuery(sqlQuery);
                //columnMetadata = query_exec.metadata.ColumnMetadata;
                columnsMetadata = query_exec.metadata.columns;
			 
			 var result_query = query_exec.getIterator(); 
			 for(i=1;i<=columnsMetadata.length ;i++){
				 columnArray.push(columnsMetadata[i]);
			 }
			 
			while(result_query.next())
			{
				var currentRow = result_query.value();
				indx = 0;
				res_val = {};
				while(columnArray.length !== indx){
				indx++;
				res_val[columnArray[indx-1]] =  currentRow[columnArray[indx-1]];
				}
				result_list.push(currentRow);
				
			}
			
			Result = {values:result_list,primarykey:primaryKeyArray};
			
		    $.response.setBody(JSON.stringify(Result));
        	$.response.status = $.net.http.OK;
		
		connection.commit();
		connection.close();
    
}

function update() {

	var currentRecords = JSON.parse($.request.body.asString()).currentRecords;
    var OriginalRecords = JSON.parse($.request.body.asString()).originalRecords;
	var tableName = JSON.parse($.request.body.asString()).sTableName;
	currentRecords = JSON.parse(currentRecords);
	OriginalRecords = JSON.parse(OriginalRecords);
	var columns = Object.keys(currentRecords);
	var sqlQuery = createSqlStatement(currentRecords, OriginalRecords, tableName, columns);
	var result = connection.executeUpdate(sqlQuery);
	connection.commit();
	//$.response.setBody(JSON.stringify(sqlQuery));
	$.response.setBody(JSON.stringify(result));
	$.response.status = $.net.http.OK;
	//	$.response.setBody(sqlQuery);
}

function insert() {

	var currentRecords = JSON.parse($.request.body.asString()).currentRecords;
	var tableName = JSON.parse($.request.body.asString()).sTableName;
	var columns = Object.keys(currentRecords);
	var sqlQuery = createInsertStatement(currentRecords, tableName, columns);
	var result = connection.executeUpdate(sqlQuery);
	connection.commit();
	//$.response.setBody(JSON.stringify(sqlQuery));
	$.response.setBody(JSON.stringify(result));
	$.response.status = $.net.http.OK;
	//	$.response.setBody(sqlQuery);
}

function deleteRecords() {

	var originalRecords = JSON.parse($.request.body.asString()).originalRecords;
	var tableName = JSON.parse($.request.body.asString()).sTableName;
	var columns = Object.keys(originalRecords);
	var sqlQuery = createDeleteStatement(originalRecords, tableName, columns);
	var result = connection.executeUpdate(sqlQuery);
	connection.commit();
	//$.response.setBody(JSON.stringify(sqlQuery));
	$.response.setBody(JSON.stringify(result));
	$.response.status = $.net.http.OK;
	//	$.response.setBody(sqlQuery);
}

function deleteAllRecords() {
	var tableName = $.request.parameters.get("sTableName");
	var filters = JSON.parse($.request.parameters.get("filters"));
	var columns = Object.keys(filters)
	var sqlQuery = '';
	if (columns.length > 0) {
		sqlQuery = createDeleteAllStatement(filters, tableName, columns);
	} else {
		sqlQuery = 'Delete from ' + tableName;

	}

	var result = connection.executeUpdate(sqlQuery);
	connection.commit();
	$.response.setBody(JSON.stringify(result));
	$.response.status = $.net.http.OK;
}

try {
	var command = $.request.parameters.get("cmd");
	switch (command) {
	    case "read":
	         read();
	         break;     
		case "update":
			update();
			break;
		case "insert":
			insert();
			break;
		case "delete":
			deleteRecords();
			break;
		case "deleteAllRecords":
			deleteAllRecords();
			break;
		default:
			break;
	}
	//$.response.setBody("records updated successfully");

} catch (e) {
	$.response.setBody(e.message);
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
} finally {
	connection.close();
}