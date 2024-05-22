import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Navigation from './Dependencies/Navigation/Navigation.tsx';
import Home from './Dependencies/Routes/Home/Home.tsx';
import ProfileHandle from './Dependencies/Routes/Profile/ProfileHandle.tsx'
import Create from './Dependencies/Routes/Create/Create.tsx'
import Contact from './Dependencies/Routes/Contact/Contact.tsx';
import Post from './Dependencies/Routes/Post/Post.tsx';
import Register from './Dependencies/Routes/Profile/Dependencies/AccountHandle/Register.tsx';
import { ContextProvider } from './ContextProvider/ContextProvider.tsx';

const rootElement: HTMLElement | null = document.getElementById('root');

if (rootElement) {
  ReactDOM.render(
    <React.StrictMode>
      <ContextProvider>
        <Router>
          <Navigation />
            <Routes>
              <Route path='/' Component={Home}/>
              <Route path='/Profile' Component={ProfileHandle}/>
              <Route path='/Register' Component={Register}/>
              <Route path='/Create' Component={Create}/>
              <Route path='/Contact' Component={Contact}/>
              <Route path='/posts/user/:userID/userName/:userName/postID/:postID/picture/:picture/page/:page' Component={Post} />
            </Routes>
        </Router>
      </ContextProvider>        
    </React.StrictMode>,
    rootElement
  );
}