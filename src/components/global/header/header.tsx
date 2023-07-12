import Style from './header.module.scss'

const header = () => {
  return (
    <header className={Style.wrapper}>
      <div className={Style.inner}>
        <div className={Style.title}>
          推論チャレンジ2022
        </div>
      </div>
    </header>
  )
}

export default header