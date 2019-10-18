function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Actions')
  .addItem('Add Employee', 'addEmployee')
  .addItem('Remove Employee', 'removeEmployee')
  .addToUi();
}

function addEmployee() {
  var ui = SpreadsheetApp.getUi();
  
  var name = ui.prompt(
    'Enter New Employee Name',
    ui.ButtonSet.OK);
  
  if (name.getSelectedButton() == ui.Button.OK) {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(template).copyTo(ss).setName(name.getResponseText());

    SpreadsheetApp.setActiveSheet(sheet);
    ss.moveActiveSheet(2);
    
    sheet.showSheet();
    
    SpreadsheetApp.flush();
    
    getEmployeeTabs();
  }
  else return;
  
}

function removeEmployee() {
  var ui = SpreadsheetApp.getUi();
  
  var name = ui.prompt(
    'Enter Employee Name For Removal',
    ui.ButtonSet.OK);
  
  if (name.getSelectedButton() == ui.Button.OK) {
  Logger.log("name.getResponseText() " + name.getResponseText())
    var ss = SpreadsheetApp.getActiveSpreadsheet().getSheets();
    
    if(name != home && name != calc && name != employeeList && name != inst && name != total && name != template) {
      try {
        SpreadsheetApp.getActiveSpreadsheet().deleteSheet(SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name.getResponseText()));
        
        SpreadsheetApp.flush();
        
        getEmployeeTabs();
        
        ui.alert(
          name.getResponseText() + ' Removed',
          ui.ButtonSet.OK);
      }
      catch(e) {
        ui.alert(
          'Invalid Employee Name',
          ui.ButtonSet.OK);
      }
    }
    else if(i == ss.length-1) {
      ui.alert(
        'Invalid Employee Name',
        ui.ButtonSet.OK);
      
    }
  }
  else return;
  
}

function getEmployeeTabs() {
  var ss = SpreadsheetApp.getActiveSpreadsheet().getSheets();
  var employees = [];
  
  for(var i=0; i<ss.length; i++) {
    var name = ss[i].getSheetName();
    if(name != home && name != calc && name != employeeList && name != inst && name != total && name != template) {
      employees.push(name);
    }
  }
  
  employees.sort();
  
  var m = employees.map(function(x,i) {
    return [x];
  });
  
  var s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(employeeList)
  s.getDataRange().clearContent();
  s.getRange(1,1,m.length,1).setValues(m);
}
