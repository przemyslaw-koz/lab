abstract class Department {
  protected employees: string[] = [];

  constructor(protected readonly id: string, private name: string) {}

  static createEmployee(name: string) {
    return { name: name };
  }

  abstract describe(this: Department): void;

  addEmployee(employee: string) {
    this.employees.push(employee);
  }

  printEmployeeInformation() {
    console.log(this.employees.length);
    console.log(this.employees);
  }
}

class ITDepartment extends Department {
  constructor(id: string, private admins: string[]) {
    super(id, "IT");
  }

  describe() {
    console.log("IT Department - ID: " + this.id);
  }
}

class AccountingDepartment extends Department {
  private lastReport: string;

  get mostRecentReport() {
    if (this.lastReport) {
      return this.lastReport;
    }
    throw new Error("No report found");
  }

  set mostRecentReport(value: string) {
    if (!value) {
      throw new Error("Please pass in correct value");
    }
    this.addReport(value);
  }

  constructor(id: string, private reports: string[]) {
    super(id, "Accountign");
    this.lastReport = reports[0];
  }

  addReport(text: string) {
    this.reports.push(text);
    this.lastReport = text;
  }

  printReports() {
    console.log(this.reports);
  }

  addEmployee(employee: string): void {
    if (employee === "Przem") {
      return;
    }
    this.employees.push(employee);
  }

  describe() {
    console.log("Accounting Department - ID: " + this.id);
  }
}

const it = new ITDepartment("d1", ["Przem"]);

it.addEmployee("Przem");
it.addEmployee("Finia");

it.printEmployeeInformation();

it.describe();

console.log(it);

const accounting = new AccountingDepartment("d2", []);

accounting.mostRecentReport = "hiłe hłe hłe";
accounting.addReport("test report hihihi");
console.log(accounting.mostRecentReport);
accounting.addEmployee("Przem");
accounting.addEmployee("Jan");

accounting.printReports();

console.log(accounting);
