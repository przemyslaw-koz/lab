function Logger(logString: string) {
  return function (constructor: Function) {
    console.log(logString);
    console.log(constructor);
  };
}

// const WithTemplate =
//   (template: string, hookId: string) => (constructor: any) => {
//     console.log("Rendering template");

//     const hookEl = document.getElementById(hookId);
//     const p = new constructor();
//     if (hookEl) {
//       hookEl.innerHTML = template;
//       hookEl.querySelector("h1")!.textContent = p.name;
//     }
//   };

const WithTemplate =
  (template: string, hookId: string) =>
  <T extends { new (...args: any[]): {} }>(originalConstructor: T) => {
    console.log("Rendering template");

    return class extends originalConstructor {
      constructor(..._: any[]) {
        super();

        const hookEl = document.getElementById(hookId);
        if (hookEl) {
          hookEl.innerHTML = template;
          //   hookEl.querySelector("h1")!.textContent = this.name;
        }
      }
    };
  };

@Logger("LOGGING")
@WithTemplate("<h1>My Person Object</h1>", "app")
class Person {
  name = "Przem";
  constructor() {
    console.log("Creating new person object...");
  }
}

const pers = new Person();

console.log(pers);

// ----------

const Log = (target: any, propertyName: string | Symbol) => {
  console.log("Property decorator!");
  console.log(target, propertyName);
};

const Log2 = (target: any, name: string, descriptor: PropertyDescriptor) => {
  console.log("Accessor decorator!");
  console.log(target);
  console.log(name);
  console.log(descriptor);
};

const Log3 = (
  target: any,
  name: string | Symbol,
  descriptor: PropertyDescriptor
) => {
  console.log("Method decorator!");
  console.log(target);
  console.log(name);
  console.log(descriptor);
};

const Log4 = (target: any, name: string | Symbol, position: number) => {
  console.log("Parameter decorator!");
  console.log(target);
  console.log(name);
  console.log(position);
};

class Product {
  @Log
  title: string;

  constructor(title: string, private _price: number) {
    this.title = title;
  }

  @Log2
  set price(val: number) {
    if (val > 0) {
      this._price = val;
    } else {
      throw new Error("Invalid price.");
    }
  }

  @Log3
  getPriceWithTax(@Log4 tax: number) {
    return this._price * (1 + tax);
  }
}
