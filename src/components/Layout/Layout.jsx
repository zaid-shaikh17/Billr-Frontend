import Sidebar from '../Sidebar/Sidebar'
import './Layout.css'

const Layout = ({ children }) => {
  return (
    <div className='layout'>
      <Sidebar />
      <div className='main-wrapper'>
        <main className='main-content'>
          {children}
        </main>
        <footer className='app-footer'>
          <p>Built by <a href='https://github.com/zaid-shaikh17' target='_blank' rel='noreferrer'>Zaid Shaikh</a> · MERN Stack Developer · <a href='https://www.linkedin.com/in/shaikh-zaid-m8329981925/' target='_blank' rel='noreferrer'>LinkedIn</a> · <a href='https://github.com/zaid-shaikh17/Billr-Frontend' target='_blank' rel='noreferrer'>GitHub</a></p>
        </footer>
      </div>
    </div>
  )
}

export default Layout