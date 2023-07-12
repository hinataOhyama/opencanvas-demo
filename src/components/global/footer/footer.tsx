import Style from './footer.module.scss'

const footer = () => {
  return (
    <footer className={Style.wrapper}>
      <p className={Style.copyright}>© 推論チャレンジ2022 groupC All rights reserved.</p>
    </footer>
  )
}

export default footer