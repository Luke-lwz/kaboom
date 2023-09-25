import { useEffect, useState } from 'react'

import toast, { ToastBar, Toaster } from 'react-hot-toast';


// Context
import PageContextProvider from './components/PageContextProvider';


// ROUTER
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation
} from "react-router-dom";

// Views
import GameView from './views/GameView'
import HomeView from './views/HomeView';
import LobbyView from './views/LobbyView';
import CardsView from './views/CardsView';
import RejoinView from './views/RejoinView';
import Privacy from './views/Privacy';

// Components
import Prompt from './components/Prompt';
import Menu from './components/Menu';
import Menu2 from './components/Menu2';
import WorkbenchView from './views/playsets/WorkbenchView';

const isBeta = import.meta.env.VITE_BETA || false;




function App() {


  const [theme, setTheme] = useState("light");

  const [prompt, setPrompt] = useState(null); // {title: string, text: string, onApprove: function}

  const [menu, setMenu] = useState(null); // contains element will be rendered as child to Menu component
  const [onMenuHide, setOnMenuHide] = useState(null); //{execute: () => {}} will be function taht gets fired once when menu is onHide

  const [menu2, setMenu2] = useState(null); // contains element will be rendered as child to Menu component
  const [onMenuHide2, setOnMenuHide2] = useState(null); //{execute: () => {}} will be function taht gets fired once when menu is onHide

  const [devMode, setDevMode] = useState(false);



  useEffect(() => {
    // devMode
    const d = localStorage.getItem("devmode");
    setDevMode(JSON.parse(d));
  }, [])

  function switchTheme(to) {
    if (!to) to = (theme === "light" ? "dark" : "light");
    document?.getElementById("theme-att")?.setAttribute("data-theme", to);
    localStorage.setItem("theme", to)
    setTheme(to);
  }



  /// PROMPT
  function promptApprove() {
    if (!prompt) return;
    prompt?.onApprove();
    setPrompt(null);
  }
  function promptCancel() {
    if (!prompt) return;
    setPrompt(null);
  }


  function connectionErrorPrompt(noCancel) {
    setPrompt({ title: "Error", text: "Connection lost! Reload?", onApprove: () => window.location.href = window.location.href, noCancel });
  }


  function allLocalStorage() {

    var values = [],
      keys = Object.keys(localStorage),
      i = keys.length;

    while (i--) {
      values.push({ key: keys[i], value: localStorage.getItem(keys[i]) });
    }

    return values;
  }



  // Menu
  function menuHide() {
    if (!menu) return;
    setMenu(null);
    if (onMenuHide?.execute) onMenuHide.execute();
    setOnMenuHide(null)
  }
  function menuHide2() {
    if (!menu2) return;
    setMenu2(null);
    if (onMenuHide2?.execute) onMenuHide2.execute();
    setOnMenuHide2(null)
  }



  function redirect(to) {
    window.location.href = to;
  }

  function navigate(to) {
    window.location.href = to;
  }


  return (
    <div className="App absolute inset-0 overflow-hidden scrollbar-hide">
      <Toaster
        position="top-left"
        reverseOrder={false}
        gutter={8}
        containerClassName=""

        containerStyle={{}}
        toastOptions={{

          // Define default options
          duration: 5000,
          style: {
            background: '#ffffff',
            color: '#000000',
          },

          // Default options for specific types
          success: {
            duration: 3000,
            theme: {
              primary: 'green',
              secondary: 'black',
            },
          },


        }}>
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <div className='w-full max-w-md flex items-center ' onClick={() => toast.dismiss(t.id)}>
                {icon}
                {message}
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>

      <PageContextProvider value={{ toast, navigate, redirect, allLocalStorage, theme, switchTheme, setPrompt, connectionErrorPrompt, menu, setMenu, setOnMenuHide, menu2, setMenu2, setOnMenuHide2, devMode, setDevMode }}>
        {prompt && <Prompt noCancel={prompt?.noCancel} onApprove={promptApprove} onCancel={promptCancel} title={prompt?.title} text={prompt?.text} element={prompt?.element} />}
        {menu2 && <Menu2 onCancel={menuHide2}>{menu2}</Menu2>}
        {menu && <Menu onCancel={menuHide}>{menu}</Menu>}

        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/lobby/:code" element={<LobbyView />} />
          <Route path="/game/:code" element={<GameView />} />
          <Route path="/rejoin/:code" element={<RejoinView />} />

          <Route path="/cards" element={<CardsView />} />
          <Route path="/cards/:id" element={<CardsView />} />

          <Route path="/privacy" element={<Privacy />} />


          <Route path="/playsets" element={<></>} />
          <Route path="/playsets/workbench" element={<WorkbenchView />} />




          <Route path="/defaultsite" element={<RedirectToStart />} />







        </Routes>
      </PageContextProvider>
      {isBeta && <BetaBanner />}
    </div>
  )
}


function BetaBanner() {
  return (
    <a href='https://discord.gg/EmDbDm6PMz' className='bg-secondary rounded-lg px-5 py-3 text-lg text-title text-secondary-content font-extrabold fixed left-2 bottom-2 cursor-pointer opacity-80'>
      BETA
    </a>
  )
}


function RedirectToStart() {

  useEffect(() => {
    window.location.href = "/"
  }, [])

  return (<></>)
}

export default App
