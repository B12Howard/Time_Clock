function setValueCalculator(cellName, value) {
  SpreadsheetApp.getActive().getRange(cellName).setValue(value);
}

// Calculates for a given employee [minutes, hours, total pay]
function totalTimeInterfaceAutomated(nameInput) {
  var calcActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(calc);
  var wage = calcActiveSheet.getRange("E2").getValue()/60; // wage in dollars/min
  var getStartDate = calcActiveSheet.getRange("A2").getValue();
  var getEndDate = new Date(calcActiveSheet.getRange("B2").getValue()).getTime()+86399000;
  var getName = nameInput;
  var colIndex = 0;
  
  //check if name box is not null
  if (getName) {
    var newActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Totals');
    var totalsData = newActiveSheet.getDataRange().getValues();
    var numColumns = newActiveSheet.getLastColumn();
    
    // inside Totals find the name of the employee then get the column number
    for(j=0; j < numColumns; j++) {
      var nameInTotals = totalsData[0][j];
      
      if (getName == nameInTotals) {
        // use this in the below for loop to get the date column corresponding to employee name
        colIndex = j-1;
        
        break;
      }
    }
    
    // Number of times in employee
    var numTimes = newActiveSheet.getRange(2, colIndex+2, totalsData.length, 1).getValues().filter(String);
    var begin = 0;
    var end = 0;
    
    //begin for loop to collect times from the Total Sheet
    //find the cell of the beginning of the range and the end of the range
    if(numTimes) {
      for(var i = 1; i < totalsData.length; i++) {
        var testDateValue = new Date(totalsData[i][colIndex]).valueOf();
        
        if(testDateValue > getEndDate) {
          end = i;
          break;
        }
        
        if(testDateValue >= getStartDate) {
          if(begin==0) {
            begin = i; //captures cell to start getting times
            Logger.log(new Date(testDateValue))
          }
          
          //Look ahead one cell. If we reach end of list/next cell is blank then break out of the loop. This is to satisfy the case of employee having only one entry
          if(i == totalsData.length || !totalsData[i+1][colIndex]) {
            Logger.log("only one entry")
            end = i+1;
            break;
          }
        }
        
        if (!totalsData[i+1][colIndex] || testDateValue > getEndDate){ //Look ahead one cell. If we reach end of list/next cell is blank, assign current i+1 to end
          Logger.log("case of blank entry before eod")
          end = i+1;
          break;
        }
      }
      //Logger.log(end-begin)
      if(end-begin<1) return(["","",""]);
      
      var copyRange = newActiveSheet.getRange(begin+1, colIndex+2, (end-begin)==0?1:(end-begin)).getValues(); //array of times collected (column with the employees name)
      var totalMin = calculateDuration(copyRange);
      var minHour = minToHours(totalMin);
      
      return (minHour.concat([totalMin*wage]));
      
    }
    else return(["","",""])
  }
}

function minToHours(totalMin) {
  var hours = Math.floor(totalMin/60);
  var mins =  Math.floor(totalMin%60);

  return([mins, hours]);
}

function calculateDuration(copyRange) {
  var hours = 0;
  var min = 0;
  var totalMin = 0;

  for(i in copyRange) {
    var tempM = new Date(copyRange[i]).getMinutes();
    var tempH = new Date(copyRange[i]).getHours();

    totalMin = totalMin + tempM + (tempH*60);
  }

  return totalMin;
}

// Calculates the hours, minutes, pay
function automateCollectTimes() {
  var calcActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(calc);
  var employeeNames = calcActiveSheet.getRange("J5:J").getValues().filter(String);
  var blankBoolean = 0;
  var employeeName = "";
  var row = 5;
  var timePayArray = [];
  var payload = [];
  
  //loop through employees
  for(var i=0; i<employeeNames.length; i++) {
    employeeName =  employeeNames[i][0]
    
    if(!employeeName) break;
    
    row = i+row;
    timePayArray = totalTimeInterfaceAutomated(employeeName); // [minutes, hours, total pay]
    
    //assign pay and time to the employee 
    var timeString = "";
    if(timePayArray[0] != "" || timePayArray[1] != "") timeString= timePayArray[1]+":"+timePayArray[0];
    else timeString = "";
    
    payload.push([timeString, timePayArray[2]?Number(timePayArray[2]).toFixed(2):""])

  }
  calcActiveSheet.getRange(5, 11, payload.length, 2).setValues(payload);
}

function saveCopyOfSheet() {
  var sheetToGetName = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(calc);
  var activeColumn = sheetToGetName.getRange("A1:B2");
  var startDate = activeColumn.getCell(2,1).getDisplayValue();
  var endDate = activeColumn.getCell(2,2).getDisplayValue();
  
  startDate = startDate.replace(/\//g, "-");
  endDate= endDate.replace(/\//g, "-");
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var destFolder = DriveApp.getFolderById(driveFolderIdForCopy);
  DriveApp.getFileById(sheet.getId()).makeCopy("Copy of Timesheet " + startDate + " to " + endDate, destFolder);
  SpreadsheetApp.getActiveSpreadsheet().toast("Saved a copy to your Drive");
}

function eraseOldTimesFromEachSheet() {
  var sheetToGetName = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(calc);
  var range = sheetToGetName.getRange("A1:B2");
  var startDateData = new Date(range.getCell(2,1).getValue());
  var endDateData = new Date(range.getCell(2,2).getValue()).valueOf()+86399000; // end date has no time, added 23 hours 59 minutes 59 seconds
  var activeColumn = sheetToGetName.getRange("J5:J");
  var employees = activeColumn.getValues().filter(String);
  var ui = SpreadsheetApp.getUi();
  var response = ui.alert('Save a copy and clear old times?', ui.ButtonSet.YES_NO);
  
  // Process the user's response.
  if (response == ui.Button.YES) {
    saveCopyOfSheet();
  }
  else return;
  
  //get employee names
  for(var i=0; i<employees.length; i++) {
    var employeeName =  employees[i][0];
    var tempSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(employeeName);
    var dateRange = tempSheet.getRange('B2:B');
    var dateRangeValues = dateRange.getValues();
    var numberOfEntrys = dateRangeValues.filter(String).length;
    
    // loop to clear out times on the employee timecard
    for(var j=0; j<numberOfEntrys; j++) {
      if(dateRange.getCell(j+1,1).getValue()) {
      }
      
      //if first date of employee is greater than end date in Calculator or no date exists. Break.
      if(j == 0 && (new Date(dateRangeValues[j][0]).getTime() > endDateData || !dateRangeValues[j][0])) {
        break;
      }

      //case next date is greater than Calculator end date or next value is blank
      else if((new Date(dateRangeValues[j+1][0]).getTime() > endDateData) || dateRangeValues[j+1][0] == ""){
        var row = j+2;     
        var remainingVals = values.slice(j+1).filter(String);

        tempSheet.getRange(2, 1, tempSheet.getMaxRows()-1, 3).clearContent();
        
        SpreadsheetApp.flush();
        
        tempSheet.getRange(2, 1, remainingVals.length, 3).setValues(remainingVals);
        
        break;
      }
    }
  }
}
