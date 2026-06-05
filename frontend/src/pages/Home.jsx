import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import UpdatesGrid from '../components/UpdatesGrid';
import './Home.css';

const Home = () => {
  return (
    <div className="home-page">
      <Header />
      <main className="main-content">
        <div className="container">
          <div className="layout">
            <section className="left-panel">
              <UpdatesGrid />
            </section>
            <aside className="right-panel">
              <Sidebar />
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
