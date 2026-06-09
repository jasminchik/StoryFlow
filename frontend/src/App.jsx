import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import Profile from './pages/Profile';
import Updates from './pages/Updates/Updates';
import MangaDetails from './pages/MangaDetails/MangaDetails';
import Saved from './pages/Saved/Saved';
import styles from './App.module.scss';

function App() {
  return (
    <div className={styles.appWrapper}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/profile/:username" element={<Profile />} />
        <Route path="/updates" element={<Updates />} />
        <Route path="/manga/:id" element={<MangaDetails />} />
        <Route path="/saved" element={<Saved />} />
      </Routes>
    </div>
  );
}

export default App;
