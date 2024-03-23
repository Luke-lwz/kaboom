import { useEffect, useState, useCallback } from 'react'

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
import LegacyCardsView from './views/legacy/LegacyCardsView';
import RejoinView from './views/RejoinView';
import Privacy from './views/Privacy';

// Components
import Prompt from './components/Prompt';
import Menu from './components/Menu';
import Menu2 from './components/Menu2';
import WorkbenchView from './views/playsets/WorkbenchView';
import CardsFilter from './components/CardsFilter';
import CardsView from './views/CardsView';
import PageCover from './components/PageCover';

//Menus
import LoginMenu from "./components/menus/LoginMenu"
import supabase from './supabase';
import PlaysetView from './views/playsets/PlaysetView';
import ProfileView from './views/ProfileView';
import PlaysetsView from './views/playsets/PlaysetsView';
import CookieConsent from 'react-cookie-consent';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import WorkbenchRedirectView from './views/playsets/workbenchComponents/RedirectView';
import { Helmet } from 'react-helmet';

const isBeta = import.meta.env.VITE_BETA || false;


const queryClient = new QueryClient()

function App() {

  const navigate = useNavigate();


  const [theme, setTheme] = useState(document.getElementById("theme-att").getAttribute("data-theme"));

  const [prompt, setPrompt] = useState(null); // {title: string, text: string, onApprove: function}

  const [menu, setMenu] = useState(null); // contains element will be rendered as child to Menu component
  const [onMenuHide, setOnMenuHide] = useState(null); //{execute: () => {}} will be function taht gets fired once when menu is onHide

  const [menu2, setMenu2] = useState(null); // contains element will be rendered as child to Menu component
  const [onMenuHide2, setOnMenuHide2] = useState(null); //{execute: () => {}} will be function taht gets fired once when menu is onHide

  const [pageCover, setPageCover] = useState(null); // element that covers page {title: string, element: string | ReactNode}


  const [devMode, setDevMode] = useState(false);

  const [user, setUser] = useState(null);




  useEffect(() => {
    // devMode
    const d = localStorage.getItem("devmode");
    setDevMode(JSON.parse(d));


    // supabase
    getUser();
  }, [])

  function switchTheme(to) {
    if (!to) to = (theme === "light" ? "dark" : "light");
    document?.getElementById("theme-att")?.setAttribute("data-theme", to);
    localStorage.setItem("theme", to)
    setTheme(to);
  }


  async function getUser() {
    try {

      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

    } catch (e) {

    }


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

  function showLoginMenu() {
    setMenu(<LoginMenu />);
  }


  const checkAuth = useCallback((func, parsedUser) => {
    if (!user && !parsedUser) {
      showLoginMenu();
      return false;
    }
    if (func) func();
    return true;

  }, [user])


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

  function smoothNavigate(to) {
    navigate(to)
  }

  async function logout() {
    try {
      const { error } = await supabase.auth.signOut()
      console.log(error)
    } catch (e) {

    }
    window.location.href = "/"
  }


  return (

    <QueryClientProvider client={queryClient}>
      <div className="App absolute inset-0 overflow-hidden scrollbar-hide">

        <Helmet>

          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Kaboom • Online 2 Rooms and a Boom</title>
          <meta name="title" content="Kaboom" />
          <meta name="description" content="Kaboom, a Two Rooms and a Boom online web app adaptation. Play kaboom card game online for free." />
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        </Helmet>
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


        <PageContextProvider value={{ user, setUser, getUser, checkAuth, logout, smoothNavigate, redirect, allLocalStorage, theme, switchTheme, setPrompt, connectionErrorPrompt, menu, setMenu, setOnMenuHide, menu2, setMenu2, setOnMenuHide2, showLoginMenu, pageCover, setPageCover, devMode, setDevMode }}>
          {pageCover && <PageCover {...pageCover} />}
          {prompt && <Prompt noCancel={prompt?.noCancel} onApprove={promptApprove} onCancel={promptCancel} title={prompt?.title} text={prompt?.text} element={prompt?.element} />}
          {menu2 && <Menu2 onCancel={menuHide2}>{menu2}</Menu2>}
          {menu && <Menu onCancel={menuHide}>{menu}</Menu>}

          <Routes>
            <Route path="/" element={<HomeView />} />
            <Route path="/lobby/:code" element={<LobbyView />} />
            <Route path="/game/:code" element={<GameView />} />
            <Route path="/rejoin/:code" element={<RejoinView />} />


            <Route path="/cards" element={<CardsView />} />


            <Route path="/privacy" element={<Privacy />} />


            <Route path="/playsets" element={<PlaysetsView />} />
            <Route path="/playsets/:id" element={<PlaysetView />} />
            <Route path="/workbench" element={<WorkbenchRedirectView />} />
            <Route path="/workbench/:playsetId" element={<WorkbenchRedirectView />} />
            <Route path="/workbench/:playsetId/edit" element={<WorkbenchRedirectView editMode={true} />} />
            <Route path="/workbench/:playsetId/remix" element={<WorkbenchRedirectView remixMode={true} />} />

            <Route path="/profile" element={<ProfileView />} />
            <Route path="/profile/:id" element={<ProfileView />} />




            <Route path="/components/cards" element={<div className='w-full h-full overflow-y-scroll scrollbar-hide'><CardsFilter /></div>} />

            <Route path="/legacy/cards" element={<LegacyCardsView />} />
            <Route path="/legacy/cards/:id" element={<LegacyCardsView />} />


            <Route path="/defaultsite" element={<RedirectToStart />} />







          </Routes>
          <CookieConsent
            location="bottom"
            buttonText="Accept"
            cookieName="consent-cookie"
            style={{ width: "fit-content", margin: "0.5rem", border: "2px solid #000000", color: "#000", background: "#fff", fontSize: "13px", borderRadius: "0.5rem", padding: "0.5rem" }}
            className="rounded-lg"
            buttonClasses="btn btn-sm btn-secondary text-title rounded"
            buttonStyle={{ backgroundColor: "#000000", color: "#fff", fontSize: "13px", borderRadius: "0.5rem", padding: "0.5rem", margin: "0.5rem" }}
          >
            <div className="flex flex-col pt-0">
              <p>🍪 We use only essential cookies to persist game data</p>
              <p className="text-xs">We won't share anything with 3rd parties</p>
            </div>

          </CookieConsent>
        </PageContextProvider>
        {/*         {isBeta && <BetaBanner />} */}

      </div>
    </QueryClientProvider>
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
