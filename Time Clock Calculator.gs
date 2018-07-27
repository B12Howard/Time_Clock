function addRecord1row (c) {
  var row = getNextRow();
  setValue('C' + row, c);
}

function customGetValue(cellName) {
  return SpreadsheetApp.getActiveSpreadsheet().getRange(cellName).getValue();
}

function eraseTimesInColumn() {
  var sheet = SpreadsheetApp.getActive().getSheetByName('Calculator');
  sheet.getRange('C2:C').clearContent();
}

function nameLookUp() {
  var nameCalcActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Calculator");
  nameCalcActiveSheet.activate();

  var nameCalcActiveColumn = nameCalcActiveSheet.getRange("A1:H2");
  //get the name from the dropdown menu
  var getName = nameCalcActiveColumn.getCell(2,7).getValue();
  return getName;
}

function totalTimeInterface() {
  //get beginning date
  var calcActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Calculator");
  calcActiveSheet.activate();
  
  //get the user start date
  var activeColumn1 = calcActiveSheet.getRange("A1:B42");
  var getStartDate = activeColumn1.getCell(2,1).getValue();
  var getEndDate1 = activeColumn1.getCell(2,2).getValue();
  var getEndDate = new Date(getEndDate1);
  getEndDate = new Date (getEndDate.setDate(getEndDate.getDate()+1))
  var getName = nameLookUp() //get the name from the drop down menu on sheet Calculator
  
  //check if name box is not null
  if (getName != "") {
  //activate Totals sheet, target the correct range
  var newActiveSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Totals');
  newActiveSheet.activate();
  var activeRangeTotals = newActiveSheet.getRange("A1:P42");
  
  // inside Totals find the name of the employee then get the column number. Couldn't get while loop to work for some reason
  for(j=1; j<17; j++) {
    var nameInTotals = activeRangeTotals.getCell(1,j).getValue();
    if (getName == nameInTotals) {
      // use this in the below for loop to get the correct column
      var nameRange = j;
      j = 28;
      
    }
  }
    //begin for loop to collect times from the Total Sheet
    var i = 0;
    var begin = 0;
    var beginCounter = 0;
    var end = 0;

    //find the cell of the beginning of the range and the end of the range
    while (activeRangeTotals.getCell(i+2,nameRange-1).getValue() <= getEndDate || !i==100){
      if (activeRangeTotals.getCell(i+2,nameRange-1).getValue() >= getStartDate && beginCounter == 0){
        begin = i;
        beginCounter = 1; //stops if statement from executing again
        //Logger.log('This is begin ' + i)
        if (activeRangeTotals.getCell(i+2+1,nameRange-1).isBlank()){ //Look ahead one cell. If we reach end of list/next cell is blank then break out of the loop. This is to satisfy the case of employee having only one entry
          Logger.log('This is in the edge case ' + i)
          break;
        }
      }
      if (activeRangeTotals.getCell(i+2+1,nameRange-1).isBlank()){ //Look ahead one cell. If we reach end of list/next cell is blank, assign current i value (cell) to end
        end = i;
        //Logger.log('This is end in isBlank ' + i)
        break;
      }
      if(i==50){ //for testing in case while loop goes haywire
        begin = 0;
        end = 0;
        break;
      }
      end = i;//increment end until while stops
      i = i+1;
      Logger.log('This is in the end of the while loop ' + i)
    }
    //Logger.log('This is end outside of while loop ' + i)
    var copyRange = newActiveSheet.getRange(begin+2, nameRange, (1+end-begin)) //? check this, writtein at 3AM
    if (i != 50){
      
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var Calculator = ss.getSheetByName("Calculator");
      if(begin==end){ //To catch the case of one employee entry, copyValuesToRange will have a begin row == end row and will not print a double copy
        end = -1;
      }
      copyRange.copyValuesToRange(Calculator, 3, 3, 5, 5+(1+end-begin)); //? check this, writtein at 3AM
      //Logger.log('Inside of copy range ' + copyRange);
      calcActiveSheet.activate();
    }
  }
}
