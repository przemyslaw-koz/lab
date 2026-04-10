const Autobind = (
  _: any,
  __: string | Symbol,
  descriptor: PropertyDescriptor
) => {
  const originalMethod = descriptor.value;
  const adjDescriptor: PropertyDescriptor = {
    configurable: true,
    enumerable: false,
    get() {
      const boundFn = originalMethod.bind(this);
      return boundFn;
    },
  };
  return adjDescriptor;
};

class Printer {
  message = "This works!";

  @Autobind
  showMessage() {
    console.log(this.message);
  }
}

const p = new Printer();

const button = document.querySelector("button")!;
button.addEventListener("click", p.showMessage);

// ------------------

interface ValidatorConfig {
  [property: string]: {
    [validatableProp: string]: string[]; //['required', 'positive']
  };
}

const reqisteredValidators: ValidatorConfig = {};

const RequiredProp = (target: any, propName: string) => {
  reqisteredValidators[target.constructor.name] = {
    ...reqisteredValidators[target.constructor.name],
    [propName]: ["required"],
  };

  console.log("construktor name", target.constructor.name);
};
const PositiveNumber = (target: any, propName: string) => {
  reqisteredValidators[target.constructor.name] = {
    ...reqisteredValidators[target.constructor.name],
    [propName]: ["positive"],
  };
};

const validate = (obj: any) => {
  const objValidatorConfig = reqisteredValidators[obj.constructor.name];
  if (!objValidatorConfig) {
    return true;
  }

  let isValid = true;
  for (const prop in objValidatorConfig) {
    console.log("prop==================", prop);
    for (const validator of objValidatorConfig[prop]) {
      console.log("val in==================", validator);
      console.log("calosc================>", objValidatorConfig);
      console.log("calosc[prop]================>", objValidatorConfig[prop]);
      switch (validator) {
        case "required":
          isValid = isValid && !!obj[prop];
          break;
        case "positive": {
          console.log("hejkaaaaaaaaaaaaaaaaaaaaaaa");
          console.log("obj[prop]==================>", obj[prop]);
          isValid = isValid && obj[prop] > 0;
          break;
        }
      }
    }
  }
  return isValid;
};

class Course {
  @RequiredProp
  title: string;

  @PositiveNumber
  price: number;

  constructor(t: string, p: number) {
    this.title = t;
    this.price = p;
  }
}

const courseForm = document.querySelector("form")!;
courseForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const titleEl = document.getElementById("title") as HTMLInputElement;
  const priceEl = document.getElementById("price") as HTMLInputElement;

  const title = titleEl.value;
  const price = +priceEl.value;

  const createCourse = new Course(title, price);

  if (!validate(createCourse)) {
    alert("Invalid input, please try again!");
    return;
  }
  console.log(createCourse);
});
