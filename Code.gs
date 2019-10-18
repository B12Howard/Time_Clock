var spreadsheetId = "YOURSPREADSHEETID";
var driveFolderIdForCopy = "DRIVEFODLERID";
var home = "home";
var employeeList = "EmployeeList";
var total = "Totals";
var calc = "Calculator";
var inst = "Instructions";
var template = "Template";

function doGet(e) {
  var SHEET_ID = e.parameter.sheet_id;  
  var html = HtmlService.createTemplateFromFile('UI');
  var names = [];
  var listName = [];
  
  html.names = getNames();
  html.listName = getListName(); //updates the app for user to see if they successfully clocked in/out
  return html.evaluate().setTitle('Time Clock');
}

//add in/out detection and return boolean this will tell whether or not to start the read/write to database
function verifyInOut(activeEmployeeName) {
  var newActiveSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(activeEmployeeName);
  
  // show the user the script is running
  var lastRow = newActiveSheet.getLastRow();
  var lastColumn = newActiveSheet.getLastColumn();
  var lastCell = newActiveSheet.getRange(lastRow, lastColumn);
  var lastCellValue = lastCell.getValue();
  var employeeAndButtonNameArr = [activeEmployeeName];
  
  // in == 1 out == 0
  //This is to call punch in
  if(lastCellValue == 'Out'){
    employeeAndButtonNameArr.push('In');
    
    return employeeAndButtonNameArr;
  }
  //this is to call punch out
  else if(lastCellValue == 'In'){
    employeeAndButtonNameArr.push('Out');
    
    return employeeAndButtonNameArr;
  }
  //this is to handle when the time card is blank
  else {
    employeeAndButtonNameArr.push('In');
    
    return employeeAndButtonNameArr;
  }
}
  
//gets the names, time, status from home sheet from the spreadsheeet and sends it to the html to dynamically post
function getData(employeeName, inOutStatus){
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(home);
  var employee = employeeName;
  var status = inOutStatus;
  var numRows = sheet.getLastRow() + 1;
  var listNames = [];
  var compareName = sheet.getRange(sheet.getLastRow(), 1).getValue();
  var compareStatus = sheet.getRange(sheet.getLastRow(), 3).getValue();

  for(j=1; j<numRows-1; j++) {
    var nameInRow = sheet.getRange(j+1,1,numRows,3).getDisplayValues();
    
    listNames[j-1] = nameInRow[0][0] + " "  + nameInRow[0][1] + " " + nameInRow[0][2];
  }
  return listNames;
}

// Get list of today's clock in/out to post to web app
function getListName() {
  var listNames = [];
  var newActiveSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('home');
  var activeColumnEmployeeNames = newActiveSheet.getRange("A1:C");
  var numRows = newActiveSheet.getLastRow();
  
  for(j=1; j<numRows; j++) {
    if (nameInRow == "") {
      break;
    }
    
    //parse name, time, status
    var nameInRow = newActiveSheet.getRange(j+1,1,1,3).getDisplayValues();
    listNames[j-1] = nameInRow[0][0] + " "  + nameInRow[0][1] + " " + nameInRow[0][2];
  }  
  return listNames;
}

//get names of employees from the employee sheet
function getNames() {
  var names = [];
  var newActiveSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName('EmployeeList');
  var activeColumnEmployeeNames = newActiveSheet.getRange("A:A");
  var numRows = newActiveSheet.getLastRow();
  
  //loop through this list and get employee names
  for(j=1; j<numRows+1; j++) {
    if (nameInRow == "") {
      break;
    }    
    var nameInRow = activeColumnEmployeeNames.getCell(j,1).getValue();
    names[j-1] = nameInRow;
  }
  return names;
}

function clearHomeTimes() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('home');
  sheet.getRange('A2:C').clearContent();
}

function punchIn(name, inOutStatus) {
  var activeEmployeeName = name;
  var newDate = new Date();
  var sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(activeEmployeeName); //make the select employee's tab active for addRecord
  var status = inOutStatus;
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var lastCell = sheet.getRange(lastRow, lastColumn);
  var lastCellValue = lastCell.getValue();
  var lastCellDate = sheet.getRange(sheet.getLastRow(), 2);
  var status = inOutStatus;
  
  // check for double clicks
  if(lastRow == 1) { var t2 = 0.0 }
  else {
    var t2 = new Date(lastCellDate.getValue()).getTime();
  }
  
  var t1 = newDate.getTime();
  var diff = t1-t2;
  
  //test if new date/time is 1 at least 20 sec (20000 ms) more than old time to prevent double logging
  if (lastCellValue != status && diff>20000) {
    var homeActiveSheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(home);
    var homeLastRow = homeActiveSheet.getRange("A:A").getValues().filter(String).length;
    
    homeActiveSheet.getRange(homeLastRow+1,1,1,3).setValues([[activeEmployeeName, newDate, status]]); 
    
    SpreadsheetApp.flush();
    
    //set data into employee's tab 
    sheet.getRange(lastRow+1,1,1,3).setValues([[activeEmployeeName, newDate, status]]);  
  }
}
