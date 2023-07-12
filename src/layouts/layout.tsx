import Header from '@/components/global/header/header'
import Footer from '@/components/global/footer/footer'
import { ReactElement } from 'react';

type LayoutProps = Required<{
  readonly children: ReactElement
}>

const Layout = ({ children }: LayoutProps) => {
  return (
    <div id="wrap">
      <Header />
      <main id="main">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;