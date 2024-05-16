import React from "react";
import { Link, useLocation } from "react-router-dom";

const links = [
  {path: "/", name: 'Home', source: "https://staging.svgrepo.com/show/22031/home-icon-silhouette.svg"},
  {path: "/Profile", name: 'Profile', source: "https://www.svgrepo.com/show/43426/profile.svg"},
  {path: "/Create", name: 'Create', source: "https://www.svgrepo.com/show/326595/create-outline.svg"},
  {path: "/Contact", name: 'Contact', source: "https://www.svgrepo.com/show/42700/telemarketer.svg"}
]

export default function Navigation() {

  const location = useLocation()

  return (
    <aside className="absolute h-full left-0 bottom-0 w-[14vw] bg-gradient-to-r from-HIGHLIGHTA to-HIGHLIGHTB">
      <h1 className="p-1 mt-10 text-WHITE text-[2rem] font-serif w-[80%] m-auto text-center">
        Your life
      </h1>
      <ul className="mt-[10%] h-[20%] flex flex-col justify-evenly">
        {links.map((link, index) => (
          <li key={index}>
            <Link className={`${location.pathname === link.path ? `text-HIGHLIGHTA bg-WHITE shadow shadow-WHITE` : 'text-WHITE bg-HIGHLIGHTA'} flex w-[80%] h-[2rem] items-center justify-evenly rounded m-auto`} to={`${link.path}`}>
              <img className={`${location.pathname === link.path ? "stroke-WHITE " : "stroke-HIGHLIGHTB"} h-[60%]`} src={link.source} alt={link.name} /> {link.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
