"use client";

import React from "react";
import styles from "./page.module.css";

const Home = () => {
  const categories = {
    "BayernCloud Experte": "chat",
    //"Function calling": "function-calling",
    //"File search": "file-search",
    //All: "all",
  };

  return (
    <>
      <main className={styles.main}>
        <div className={styles.title}>
          Fragen zur BayernCloud? Hier findest du Antworten!
        </div>
        <div className={styles.container}>
          {Object.entries(categories).map(([name, url]) => (
            <a key={name} className={styles.category} href={`/${url}`}>
              {name}
            </a>
          ))}
        </div>
      </main>
      <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <a href="https://bayerncloud.digital/impressum/" className={styles.footerLink}>Impressum</a>
        <a href="https://bayerncloud.digital/datenschutz/" className={styles.footerLink}>Datenschutz</a>
      </div>
      <div className={styles.footerCopyright}>
        © 2024 Bayern Tourismus Marketing GmbH
      </div>
    </footer>
  </>
  );
};

export default Home;
