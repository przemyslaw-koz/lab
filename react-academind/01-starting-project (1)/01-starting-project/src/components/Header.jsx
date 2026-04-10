import logo from "../assets/investment-calculator-logo.png";

export default function Header() {
  return (
    <header id="header" alt="Logo showing a money bag">
      <img src={logo}></img>
      <h1>React Investment Calculator</h1>
    </header>
  );
}
