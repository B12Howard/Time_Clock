function doGet(e) {
  var SHEET_ID = e.parameter.sheet_id;  
  var html = HtmlService.createTemplateFromFile('UI');
  var names = [];
  var listName = [];
  
  html.names = getNames();
  html.listName = getListName(); //updates for user to see if they successfully clocked in/out
  return html.evaluate().setTitle('Time Clock');
}

//add in/out detection and return boolean this will tell whether or not to start the read/write to database
function verifyInOut(activeEmployeeName, buttonName) {
  var newActiveSheet = SpreadsheetApp.openById("147DITdK9WwDuEaoMsW7dK4s_8qNfymTZrExrxVEKLCo").getSheetByName(activeEmployeeName); //use your Google Sheet ID
  newActiveSheet.activate();
  
  // show the user the script is running
  var lastRow = newActiveSheet.getLastRow();
  var lastColumn = newActiveSheet.getLastColumn();
  var lastCell = newActiveSheet.getRange(lastRow, lastColumn);
  var lastCellValue = lastCell.getValue();
  var button = buttonName;
  var employeeAndButtonNameArr = [activeEmployeeName];
  
  //This is to call punch in
  if(lastCellValue == 'Out'){
    employeeAndButtonNameArr.push("trueIn");
    return employeeAndButtonNameArr;
  }
  //this is to call punch out
  else if(lastCellValue == 'In'){
    employeeAndButtonNameArr.push("trueOut");
    return employeeAndButtonNameArr;
  }
  else {//this is to handle when the time card is blank
    employeeAndButtonNameArr.push("trueIn");
    return employeeAndButtonNameArr;
  }
  
}
  
//gets the names, time, status from home sheet from the spreadsheeet and sends it to the html to dynamically post
function getData(employeeName, inOutStatus){
  var sheet = SpreadsheetApp.openById("147DITdK9WwDuEaoMsW7dK4s_8qNfymTZrExrxVEKLCo").getSheets()[0]; //use your Google Sheet ID
  sheet.activate();
  var employee = employeeName;
  var status = inOutStatus;
  var numRows = sheet.getLastRow() + 1;
  var listNames = [];
  var compareName = sheet.getRange(sheet.getLastRow(), 1);
  var compareStatus = sheet.getRange(sheet.getLastRow(), 3);
  
  //check if the last entry really is the person punching in/out then send the data to the UI. This is to prevent double posting
  if(compareName != employee && compareStatus != status) {
    for(j=1; j<numRows; j++) {
      var nameInRow = sheet.getRange(j+1,1,numRows,3).getDisplayValues();
      listNames[j-1] = nameInRow[0][0] + " "  + nameInRow[0][1] + " " + nameInRow[0][2];
    }
    return listNames;
  }
}

function getListName() {
  var listNames = [];
  var newActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('home');
  newActiveSheet.activate();
  var activeColumnEmployeeNames = newActiveSheet.getRange("A1:C40");
  var numRows = SpreadsheetApp.getActiveSpreadsheet().getLastRow();
  
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
  var newActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('EmployeeList');
  newActiveSheet.activate();
  var activeColumnEmployeeNames = newActiveSheet.getRange("A:A");
  //find number of nonempty rows
  var numRows = SpreadsheetApp.getActiveSpreadsheet().getLastRow();
  
  //loop through this list and get names
  for(j=1; j<numRows+1; j++) {
    if (nameInRow == "") {
      break;
    }    
    var nameInRow = activeColumnEmployeeNames.getCell(j,1).getValue();
    names[j-1] = nameInRow;
  }
  return names;
}

//functions from original version of the time clock. This allows sheet to be used without the HTML/JS interface
function setValue(cellName, value) {
  SpreadsheetApp.getActive().getRange(cellName).setValue(value);
}

function customGetValue(cellName) {
  return SpreadsheetApp.getActiveSpreadsheet().getRange(cellName).getValue();
}

function getNextRow() {
  return SpreadsheetApp.getActiveSheet().getLastRow()+1
}

function addRecord (a, b, c) {
  var row = getNextRow();
  setValue('A' + row, a);
  setValue('B' + row, b);
  setValue('C' + row, c);
}

function clearRange() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('home');
  sheet.getRange('G1').clearContent();
}

function clearHomeTimes() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('home');
  sheet.getRange('A2:C').clearContent();
}

function punchIn(name, inOutStatus) {
  var activeEmployeeName = name;
  var newDate = new Date();
  
  var newActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(activeEmployeeName); //make the select employee's tab active for addRecord
  newActiveSheet.activate();
  
  var sheet = SpreadsheetApp.getActiveSheet();
  //var employee = name;
  var status = inOutStatus;
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var lastCell = sheet.getRange(lastRow, lastColumn);
  var lastCellValue = lastCell.getValue();
  var lastCellDate = sheet.getRange(sheet.getLastRow(), 2);
  if(lastCellDate.getValue() == 'Time'){
    var t2 = 0.0
    }
  else{
    var prevDateTime = new Date(lastCellDate.getValue());
    var t2 = prevDateTime.getTime();
    }
  
  //var prevDateTime = new Date(lastCellDate.getValue());
  var t1 = newDate.getTime();
  //var t2 = prevDateTime.getTime();
  var diff = t1-t2;
  
  //test if new date/time is 1 at least 20 sec (20000 ms) more than old time to prevent double logging
  if (lastCellValue != 'In' && diff>20000) {
    //put time into employee's tab 
    addRecord(activeEmployeeName, newDate, 'In'); 
    //post to UI
    var homeActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("home");
    homeActiveSheet.activate();
    addRecord(activeEmployeeName, newDate, 'In');
  }
}

function punchOut(name, inOutStatus) {
  var activeEmployeeName = name;
  var newDate = new Date();
    
  var newActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(activeEmployeeName);
  newActiveSheet.activate();
  var sheet = SpreadsheetApp.getActiveSheet();
  var lastRow = sheet.getLastRow();
  var lastColumn = sheet.getLastColumn();
  var lastCell = sheet.getRange(lastRow, lastColumn);
  var lastCellValue = lastCell.getValue();
  var lastCellDate = sheet.getRange(sheet.getLastRow(), 2);
  if(lastCellDate.getValue() == 'Time'){
    var t2 = 0.0
    }
  else{
    var prevDateTime = new Date(lastCellDate.getValue());
    var t2 = prevDateTime.getTime();
    }
  
  //var prevDateTime = new Date(lastCellDate.getValue());
  var t1 = newDate.getTime();
  //var t2 = prevDateTime.getTime();
  var diff = t1-t2;
  
  //check if the last entry really is the person punching in/out then send the data to the UI. And test if new date/time is 1 at least 20 sec (20000 ms) more than old time to prevent double logging
  if (lastCellValue != 'Out' && diff>20000) { 
    addRecord(activeEmployeeName, newDate, 'Out');
    var homeActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("home");
    homeActiveSheet.activate();
    addRecord(activeEmployeeName, newDate, 'Out');
  }
}
