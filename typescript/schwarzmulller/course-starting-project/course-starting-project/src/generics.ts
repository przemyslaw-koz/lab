const merge = <T extends object, U extends object>(objA: T, objB: U) => {
  return Object.assign(objA, objB);
};

console.log(
  merge({ name: "Przem", hobbies: ["alcohol", "drugs"] }, { age: 33 })
);

const mergedObj = merge(
  { name: "Przem", hobbies: ["alcohol", "drugs"] },
  { age: 33 }
);

interface Lengthy {
  length: number;
}

const countAndPrint = <T extends Lengthy>(element: T): [T, string] => {
  let descriptionText = "Got no value";
  if ((element.length = 1)) {
    descriptionText = `Got 1 element`;
  } else if (element.length > 1) {
    descriptionText = `Got ${element.length} elements`;
  }
  return [element, descriptionText];
};

const extractAndConvert = <T extends object, U extends keyof T>(
  obj: T,
  key: U
) => {
  return "Value" + obj[key];
};

// extractAndConvert({}, "name");

extractAndConvert({ name: "Przem" }, "name");

class DataStorage<T> {
  private data: T[] = [];

  addItem(item: T) {
    this.data.push(item);
  }

  removeItem(item: T) {
    this.data.splice(this.data.indexOf(item), 1);
  }

  getItems() {
    return [...this.data];
  }
}

const textStorage = new DataStorage<string>();
textStorage.addItem("Przem");
textStorage.addItem("Finia");
textStorage.removeItem("Przem");
console.log(textStorage.getItems());

const numberStorage = new DataStorage<number>();

const objStorage = new DataStorage<object>();
objStorage.addItem({ name: "Przem" });
objStorage.addItem({ name: "Finia" });

objStorage.removeItem({ name: "Przem" });

interface CourseGoal {
  title: string;
  description: string;
  completeUntil: Date;
}

const createCourseGoal = (
  title: string,
  description: string,
  date: Date
): CourseGoal => {
  let courseGoal: Partial<CourseGoal> = {};
  courseGoal.title = title;
  courseGoal.description = description;
  courseGoal.completeUntil = date;

  return courseGoal as CourseGoal;
};

const names: Readonly<string[]> = ["Przem", "Finia"];
// names.push("Wódek");
