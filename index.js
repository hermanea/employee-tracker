const inquirer = require("inquirer");
const mysql = require('mysql2');
const consoleTable = require('console.table');

// Initiates inquirer to serve the user a prompt with several options, then determines which function to execute depending on user choices.
function init() {
    inquirer.prompt({
        type:"list",
        message:"How would you like to proceed?",
        name:"option",
        choices: ["View All Employees","View All Roles","View All Departments","Update An Employee Role","Add An Employee","Add A Role", "Add A Department","Quit"],
    }).then(response =>{
        switch(response.option) {
            case "View All Employees":
                getEmployees();
                break;
            case "Add An Employee":
                addEmployee();
                break;
            case "Update An Employee Role":
                updateEmployee();
                break;
            case "View All Roles":
                getRole();
                break;
            case  "Add A Role":
                addRole();
                break;
            case "View All Departments":
                 getDepartments();
                break;
            case "Add A Department":
                addDepartment();
                break;
            case "Quit":
                process.exit();
        }
    })
}

// Intities connection with the database.
const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'employee_db'
    },
    console.log(`Connected to the empoyee_db database.`)
);
// Function that queries department data from the database and prints to a table.
function getDepartments(){
    db.query('SELECT * FROM department ORDER BY department.id', function (err, results) {
       console.table(results);
       init();
      });
}

// Function that queries role data from the database and prints to a table.
function getRole(){
    db.query('SELECT role.id, role.title, department.name, role.salary FROM role JOIN department on department_id = department.id ORDER BY role.id', function (err, results) {
        console.table(results);
        init();
    });
}

// Function that queries employee data from the database and prints to a table.
function getEmployees(){
    db.query(`SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS department, role.salary, CONCAT(manager.first_name,' ',manager.last_name) AS manager FROM employee JOIN role ON role_id = role.id JOIN department ON department_id = department.id  LEFT JOIN employee manager ON manager.id = employee.manager_id ORDER BY employee.id`, function (err, results) {
        console.table(results);
        init();
      });
}



// Function that adds a department to the database.
function addDepartment(){
    inquirer.prompt({
        type:"input",
        message:"what is the name of the department?",
        name: "name",
    }).then(response =>{
        db.query('INSERT INTO department(name) VALUE(?)',[response.name], function (err, results){});
        init();
    })
}

// Function that adds a role to the database.
function addRole(){
    const departmentList = []
    db.query("SELECT name FROM department", function (err, results){
        for(let result of results){
            departmentList.push(result.name);
        }
    });

    inquirer.prompt([{
        type:"input",
        message:"What is the role's name?",
        name: "name",
    },
    {
        type:"input",
        message:"what is the role's salary?",
        name: "salary",
    },
    {
        type:"list",
        message:"Which department does the role belong to?",
        name: "department",
        choices: departmentList,            
    }
    ]).then(response =>{
        db.query("SELECT id FROM department WHERE name = ?", [response.department], function (err,results){
            db.query("INSERT INTO role (title, salary, department_id ) VALUES (?,?,?)",[response.name, response.salary, results[0].id], function (err, res){
                init();
            });    
        });
    })
}

// Function that adds an employee.
function addEmployee(){
    const roleList = []
    db.query("SELECT title FROM role", function (err, results){
        for(let result of results){
            roleList.push(result.title);
        }   
    });

    const employeeList = ["None"]
    db.query("SELECT * FROM employee", function (err, results){
        for(let result of results){
            employeeList.push(result.first_name + " " + result.last_name);
        }
    });

    inquirer.prompt([{
        type:"input",
        message:"What is the first name of the employee?",
        name: "firstName",
    },
    {
        type:"input",
        message:"What is the last name of the employee?",
        name: "lastName",
    },
    {
        type:"list",
        message:"What is the employee's role?",
        name: "role",
        choices: roleList,        
    },
    {
        type:"list",
        message:"Who is the employee's manager?",
        name: "manager",
        choices: employeeList,        
    }
    ]).then(response =>{
        db.query("SELECT id FROM role WHERE title = ?", [response.role], function (err,results){
            const managerName = response.manager.split(" ");
           
            db.query("SELECT id FROM employee WHERE first_name = ? AND last_name = ?", [managerName[0], managerName[1]], function (err, res){
                let managerId = 0;
                if(response.manager != "None"){
                    managerId = res[0].id; 
                } else {
                    managerId= null;
                }
                db.query("INSERT INTO employee (first_name, last_name, role_id, manager_id ) VALUES (?,?,?,?)",[response.firstName, response.lastName, results[0].id,managerId], function (err, res){
                    init();
                });
            });
        });
    })
}

// Function that updates an employee's role.
function updateEmployee(){
    const employeeList = []
    const roleList = []
    db.query("SELECT * FROM employee", function (err, results){
        for(let result of results){
            employeeList.push(result.first_name + " " + result.last_name);
        }
        db.query("SELECT title FROM role", function (err, results){
            for(let result of results){
                roleList.push(result.title);
            }
            inquirer.prompt([{
                type:"list",
                message:"Which employee's role would you like to update?",
                name: "employeeSelected",
                choices: employeeList,
            },
            {
                type:"list",
                message:"Which new role would you like to assign to the emloyee?",
                name: "roleSelected",
                choices: roleList,
            }
            ]).then(response =>{
                db.query("SELECT id FROM role WHERE title = ?", [response.roleSelected], function (err,results){
                    const employeeName = response.employeeSelected.split(" ");
                    db.query("UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ?",[results[0].id,employeeName[0],employeeName[1]], function (err,res){
                        init();
                    });
                });
            });
        });
    });
}

init();
