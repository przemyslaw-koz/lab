interface Greetable {
  name: string;

  greet(phrase: string): void;
}

class PersonObj implements Greetable {
  name: string;
  age = 30;

  constructor(name: string) {
    this.name = name;
  }

  greet(phrase: string): void {
    console.log(phrase + " " + this.name);
  }
}

let user1: Greetable;

user1 = new PersonObj("PRzem");

user1.greet("Elo");
