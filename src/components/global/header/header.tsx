import Style from "./header.module.scss";

const header = () => {
  return (
    <header className={Style.wrapper}>
      <div className={Style.inner}>
        <div className={Style.title}>オープンキャンパス2023デモ</div>
      </div>
    </header>
  );
};

export default header;
