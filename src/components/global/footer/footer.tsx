import Style from './footer.module.scss'

const footer = () => {
  return (
    <footer className={Style.wrapper}>
      <p className={Style.copyright}>© 古崎研 All rights reserved.</p>
    </footer>
  )
}

export default footer