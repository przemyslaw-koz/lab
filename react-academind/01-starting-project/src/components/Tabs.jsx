export default function Tabs({ children, buttons, buttonsContainer = "menu" }) {
  const ButtonConatiner = buttonsContainer;

  return (
    <>
      <ButtonConatiner>{buttons}</ButtonConatiner>
      {children}
    </>
  );
}
