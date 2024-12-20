"use client";

import React from "react";
import styles from "./page.module.css";

const Home = () => {
  const categories = {
    "BCT Experte 🚀": "chat",
    //"Function calling": "function-calling",
    //"File search": "file-search",
    //All: "all",
  };

  return (
    <>
      <main className={styles.main}>
        <div className={styles.title}>
          Fragen zur BayernCloud Tourismus?<br/><br/>Hier findest du Antworten!
        </div>
        <div className={styles.container}>
          {Object.entries(categories).map(([name, url]) => (
            <a key={name} className={styles.category} href={`/${url}`}>
              {name}
            </a>
          ))}
        </div>
        <div className={styles.category2}>
          <p>Bitte bedenkt, dass es sich um einen Demonstrator handelt, nicht um ein fertiges Produkt. Es können Fehler in den Antworten enthalten sein, prüft die Ergebnisse daher genau. Der BayernCloud Tourismus Experte nutzt die API von OpenAI. Mit Nutzung erklären sie sich mit deren <a target="blank" href="https://openai.com/de-DE/policies/privacy-policy/">Datenschutzrichtlinien</a> einverstanden.</p>
        </div>
      </main>
      <footer className={styles.footer}>
      <div className={styles.footerLinks}>
        <a href="https://bayerncloud.digital/impressum/" target="_blank" className={styles.footerLink}>Impressum</a>
        <a href="https://bayerncloud.digital/datenschutz/" target="_blank" className={styles.footerLink}>Datenschutz</a>
      </div>
      <div className={styles.footerCopyright}>
        © 2024 Bayern Tourismus Marketing GmbH
      </div>
    </footer>
  </>
  );
};

export default Home;
