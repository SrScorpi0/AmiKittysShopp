type HeaderMobileProps = {
  onOpenMenu: () => void;
};

export default function HeaderMobile({ onOpenMenu }: HeaderMobileProps) {
  return (
    <header className="header-mobile">
      <div className="header-mobile__brand">
        <img className="logo" src="/img/Logo/Logo.png" alt="AmiKittyShop" />
        <h1 className="logo-titulo">AmiKittyShop</h1>
      </div>
      <button className="open-menu" id="open-menu" type="button" onClick={onOpenMenu}>
        <i className="bi bi-list" />
      </button>
    </header>
  );
}
